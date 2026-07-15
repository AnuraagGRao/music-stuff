import { useEffect, useMemo, useState } from 'react'
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth'
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
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({})
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userTracks, setUserTracks] = useState<Track[]>([])

  const { setTracks, tracks, addTrack } = useAudioStore()
  const tracksCollection = useMemo(() => collection(db, 'tracks'), [])

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setIsAuthenticated(!!currentUser)
      setError(null)
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
        setError('Failed to load your tracks')
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
      setError(null)
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: 'select_account' })
      await signInWithPopup(auth, provider)
    } catch (err) {
      let errorMsg = 'Failed to sign in'
      const firebaseErr = err as { code?: string; message?: string } | null
      
      if (firebaseErr?.code === 'auth/configuration-not-found') {
        errorMsg = 'Firebase auth not configured. Please:\n1. Go to Firebase Console\n2. Enable Google as an auth provider\n3. Add localhost:5173 to authorized redirect URIs'
      } else if (firebaseErr?.code === 'auth/popup-blocked') {
        errorMsg = 'Sign-in popup was blocked. Please allow popups for this site.'
      } else if (firebaseErr?.code === 'auth/popup-closed-by-user') {
        errorMsg = 'Sign-in cancelled'
        setError(null)
        return
      } else if (firebaseErr?.message) {
        errorMsg = firebaseErr.message
      }
      
      setError(errorMsg)
      console.error('Login error:', err)
    }
  }

  const logout = async () => {
    try {
      setError(null)
      await signOut(auth)
      setUserTracks([])
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to sign out'
      setError(errorMsg)
      console.error('Logout error:', err)
    }
  }

  const uploadTrack = async (file: File, metadata?: Partial<Track>) => {
    if (!user) {
      setError('Sign in required to upload tracks')
      throw new Error('Sign in required')
    }

    if (!file.type.startsWith('audio/')) {
      setError('Invalid file type. Please upload an audio file.')
      throw new Error('Invalid file type')
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

      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)

      // Save track metadata to Firestore
      const trackDoc: DocumentReference = await addDoc(tracksCollection, {
        title: metadata?.title || file.name.replace(/\.[^/.]+$/, ''),
        artist: metadata?.artist || 'Unknown',
        album: metadata?.album || 'Uploads',
        duration: metadata?.duration || 0,
        audioUrl: downloadURL,
        coverUrl: metadata?.coverUrl || 'https://via.placeholder.com/256',
        ownerId: user.uid,
        lyricsStatus: 'pending',
        lyrics: metadata?.lyrics || [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      // Add to local store immediately for optimistic UI
      const newTrack: Track = {
        id: trackDoc.id,
        title: metadata?.title || file.name.replace(/\.[^/.]+$/, ''),
        artist: metadata?.artist || 'Unknown',
        album: metadata?.album || 'Uploads',
        duration: metadata?.duration || 0,
        audioUrl: downloadURL,
        coverUrl: metadata?.coverUrl || 'https://via.placeholder.com/256',
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
    loginWithGoogle,
    logout,
    uploadTrack,
    uploadProgress,
    isUploading,
    error,
    userTracks,
  }
}
