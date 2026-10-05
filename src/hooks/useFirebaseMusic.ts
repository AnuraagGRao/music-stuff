import { useEffect, useMemo, useState } from 'react'
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  type User,
} from 'firebase/auth'
import {
  addDoc,
  collection,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  type DocumentReference,
} from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytesResumable, type UploadTask } from 'firebase/storage'
import { auth, db, storage } from '../lib/firebase'
import { useAudioStore } from '../store/audioStore'
import type { Track } from '../types'

type UploadProgress = {
  [fileId: string]: number
}

export function useFirebaseMusic() {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({})
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userTracks, setUserTracks] = useState<Track[]>([])

  const { setTracks, tracks, addTrack } = useAudioStore()
  const tracksCollection = useMemo(() => collection(db, 'tracks'), [])

  // Listen to auth state changes and handle redirect auth result
  useEffect(() => {
    // Check redirect sign-in result (for mobile / popup-blocked fallbacks)
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          setUser(result.user)
          setIsAuthenticated(true)
          setIsAuthenticating(false)
          setError(null)
        }
      })
      .catch((err) => {
        console.warn('Redirect auth check notice:', err)
      })

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setIsAuthenticated(!!currentUser)
      setIsAuthenticating(false)
      if (currentUser) {
        setError(null)
      }
    })

    return () => unsubscribe()
  }, [])

  // Listen to user's uploaded tracks
  useEffect(() => {
    if (!user) {
      setUserTracks([])
      return
    }

    const userTracksQuery = query(tracksCollection, where('ownerId', '==', user.uid))

    const unsubscribe = onSnapshot(
      userTracksQuery,
      (snapshot) => {
        const fetchedTracks = snapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            title: data.title || 'Untitled',
            artist: data.artist || 'Unknown',
            album: data.album || 'Unknown',
            duration: data.duration || 0,
            audioUrl: data.audioUrl || '',
            coverUrl: data.coverUrl || 'https://via.placeholder.com/256',
            ownerId: data.ownerId,
            lyrics: data.lyrics || [],
          } as Track
        })
        setUserTracks(fetchedTracks)
      },
      (err) => {
        console.error('Error fetching user tracks:', err)
        setError('Failed to load your personal tracks from cloud storage')
      },
    )

    return () => unsubscribe()
  }, [user, tracksCollection])

  // Merge public and user tracks
  useEffect(() => {
    const publicTracks = tracks.filter((t) => t.ownerId === 'public')
    const mergedTracks = [...publicTracks, ...userTracks]
    const uniqueTracks = Array.from(new Map(mergedTracks.map((t) => [t.id, t])).values())
    setTracks(uniqueTracks)
  }, [userTracks])

  const loginWithGoogle = async () => {
    try {
      setIsAuthenticating(true)
      setError(null)
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: 'select_account' })

      await signInWithPopup(auth, provider)
      setIsAuthenticating(false)
    } catch (err) {
      const firebaseErr = err as { code?: string; message?: string } | null
      let errorMsg = 'Failed to sign in with Google'

      if (firebaseErr?.code === 'auth/unauthorized-domain') {
        const domain = typeof window !== 'undefined' ? window.location.hostname : 'current domain'
        errorMsg = `Domain "${domain}" is not authorized in Firebase. Add "${domain}" under Firebase Console > Authentication > Settings > Authorized domains.`
      } else if (
        firebaseErr?.code === 'auth/operation-not-allowed' ||
        firebaseErr?.code === 'auth/configuration-not-found'
      ) {
        errorMsg = 'Google Sign-in is not enabled in your Firebase project. Go to Firebase Console (https://console.firebase.google.com/) > Select "music-stuff-7420" > Authentication > Sign-in method > Add/Enable Google provider.'
      } else if (firebaseErr?.code === 'auth/popup-blocked') {
        try {
          const provider = new GoogleAuthProvider()
          provider.setCustomParameters({ prompt: 'select_account' })
          await signInWithRedirect(auth, provider)
          return
        } catch (_redirectErr) {
          errorMsg = 'Sign-in popup and redirect were blocked. Please enable popups for this site in your browser.'
        }
      } else if (
        firebaseErr?.code === 'auth/popup-closed-by-user' ||
        firebaseErr?.code === 'auth/cancelled-popup-request'
      ) {
        setError(null)
        setIsAuthenticating(false)
        return
      } else if (firebaseErr?.message) {
        errorMsg = firebaseErr.message
      }

      setError(errorMsg)
      setIsAuthenticating(false)
      console.error('Login error:', err)
    }
  }

  const logout = async () => {
    try {
      setError(null)
      await signOut(auth)
      setUser(null)
      setIsAuthenticated(false)
      setUserTracks([])
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to sign out'
      setError(errorMsg)
      console.error('Logout error:', err)
    }
  }

  const uploadTrack = async (file: File, metadata?: Partial<Track>) => {
    if (!file.type.startsWith('audio/')) {
      setError('Invalid file type. Please upload an audio file.')
      throw new Error('Invalid file type')
    }

    if (!user) {
      setError('Sign in required to upload tracks')
      throw new Error('Sign in required')
    }

    setIsUploading(true)
    const fileId = `${user.uid}-${Date.now()}`

    try {
      // Upload to Storage
      const storageRef = ref(storage, `audio/${user.uid}/${Date.now()}-${file.name}`)
      const uploadTask: UploadTask = uploadBytesResumable(storageRef, file)

      // Track progress
      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            setUploadProgress((prev) => ({
              ...prev,
              [fileId]: Math.round(progress),
            }))
          },
          reject,
          resolve,
        )
      })

      const downloadURL = await getDownloadURL(storageRef)

      // Save metadata to Firestore
      const trackDoc: DocumentReference = await addDoc(tracksCollection, {
        title: metadata?.title || file.name.replace(/\.[^/.]+$/, ''),
        artist: metadata?.artist || user.displayName || 'Unknown Artist',
        album: metadata?.album || 'My Uploads',
        duration: metadata?.duration || 0,
        audioUrl: downloadURL,
        coverUrl: metadata?.coverUrl || user.photoURL || 'https://via.placeholder.com/256',
        ownerId: user.uid,
        isPublic: false,
        lyricsStatus: 'pending',
        lyrics: metadata?.lyrics || [],
        createdAt: serverTimestamp(),
      })

      const newTrack: Track = {
        id: trackDoc.id,
        title: metadata?.title || file.name.replace(/\.[^/.]+$/, ''),
        artist: metadata?.artist || user.displayName || 'Unknown Artist',
        album: metadata?.album || 'My Uploads',
        duration: metadata?.duration || 0,
        audioUrl: downloadURL,
        coverUrl: metadata?.coverUrl || user.photoURL || 'https://via.placeholder.com/256',
        ownerId: user.uid,
        lyrics: metadata?.lyrics || [],
      }

      addTrack(newTrack)
      setError(null)
      return trackDoc.id
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to upload track'
      setError(errorMsg)
      console.error('Upload error:', err)
      throw err
    } finally {
      setIsUploading(false)
      setUploadProgress((prev) => {
        const newProgress = { ...prev }
        delete newProgress[fileId]
        return newProgress
      })
    }
  }

  return {
    user,
    isAuthenticated,
    isAuthenticating,
    loginWithGoogle,
    logout,
    uploadTrack,
    uploadProgress,
    isUploading,
    error,
    clearError: () => setError(null),
    userTracks,
  }
}
