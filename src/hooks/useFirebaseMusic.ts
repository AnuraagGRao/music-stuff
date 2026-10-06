import { useEffect, useMemo, useRef, useState } from 'react'
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
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
  type DocumentReference,
} from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytesResumable, type UploadTask } from 'firebase/storage'
import { auth, db, storage } from '../lib/firebase'
import { useAudioStore } from '../store/audioStore'
import { PLAN_LIMITS } from '../utils/planLimits'
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
  const userProfileUnsubscribeRef = useRef<(() => void) | null>(null)

  const { setTracks, tracks, addTrack } = useAudioStore()
  const tracksCollection = useMemo(() => collection(db, 'tracks'), [])

  // Listen to auth state changes and sync user plan from Firestore DB
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

      if (userProfileUnsubscribeRef.current) {
        userProfileUnsubscribeRef.current()
        userProfileUnsubscribeRef.current = null
      }

      if (currentUser) {
        setError(null)
        // Real-time listener to Firestore users/{uid} document
        const userDocRef = doc(db, 'users', currentUser.uid)
        userProfileUnsubscribeRef.current = onSnapshot(
          userDocRef,
          (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data()
              const isPro = data?.plan === 'pro' || data?.isPro === true
              useAudioStore.getState().setUserPlan(isPro ? 'pro' : 'free')
            } else {
              // Seed initial user document in Firestore with 'free' tier
              setDoc(
                userDocRef,
                {
                  uid: currentUser.uid,
                  email: currentUser.email || '',
                  displayName: currentUser.displayName || '',
                  photoURL: currentUser.photoURL || '',
                  plan: 'free',
                  createdAt: serverTimestamp(),
                },
                { merge: true },
              ).catch((initErr) => {
                console.warn('Could not initialize user document in Firestore:', initErr)
              })
              useAudioStore.getState().setUserPlan('free')
            }
          },
          (profileErr) => {
            console.warn('User profile listener notice:', profileErr)
          },
        )
      } else {
        useAudioStore.getState().setUserPlan('free')
      }
    })

    return () => {
      unsubscribe()
      if (userProfileUnsubscribeRef.current) {
        userProfileUnsubscribeRef.current()
        userProfileUnsubscribeRef.current = null
      }
    }
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
      if (userProfileUnsubscribeRef.current) {
        userProfileUnsubscribeRef.current()
        userProfileUnsubscribeRef.current = null
      }
      await signOut(auth)
      setUser(null)
      setIsAuthenticated(false)
      setUserTracks([])
      useAudioStore.getState().setUserPlan('free')
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to sign out'
      setError(errorMsg)
      console.error('Logout error:', err)
    }
  }

  const getAudioContentType = (file: File): string => {
    if (file.type && file.type.startsWith('audio/')) return file.type
    const ext = file.name.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'mp3': return 'audio/mpeg'
      case 'wav': return 'audio/wav'
      case 'ogg': return 'audio/ogg'
      case 'm4a': return 'audio/mp4'
      case 'flac': return 'audio/flac'
      case 'aac': return 'audio/aac'
      default: return 'audio/mpeg'
    }
  }

  const uploadTrack = async (file: File, metadata?: Partial<Track>) => {
    const isAudio =
      Boolean(file.type && (file.type.startsWith('audio/') || file.type === 'video/mp4' || file.type === 'audio/x-m4a')) ||
      /\.(mp3|wav|ogg|m4a|flac|aac|wma|aiff|alac)$/i.test(file.name)

    if (!isAudio) {
      setError('Invalid file type. Please upload an audio file.')
      throw new Error('Invalid file type')
    }

    if (!user) {
      setError('Sign in required to upload tracks')
      throw new Error('Sign in required')
    }

    const userPlan = useAudioStore.getState().userPlan
    const planConfig = PLAN_LIMITS[userPlan] || PLAN_LIMITS.free

    if (file.size > planConfig.maxFileSizeBytes) {
      const errorMsg = `File size exceeds the ${planConfig.tierName} limit of ${planConfig.formattedFileSize}. Upgrade to Pro for up to 100 MB uploads.`
      setError(errorMsg)
      throw new Error(errorMsg)
    }

    if (userPlan === 'free' && userTracks.length >= planConfig.maxTracks) {
      const errorMsg = `Storage quota full (${planConfig.maxTracks} tracks max on Free). Upgrade to Pro for unlimited audio storage.`
      setError(errorMsg)
      throw new Error(errorMsg)
    }

    setIsUploading(true)
    const fileId = `${user.uid}-${Date.now()}`
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const contentType = getAudioContentType(file)

    // Calculate duration in the background
    let duration = metadata?.duration || 0
    if (!duration && typeof window !== 'undefined') {
      try {
        duration = await new Promise<number>((resolve) => {
          const audio = new Audio()
          const url = URL.createObjectURL(file)
          audio.preload = 'metadata'
          audio.onloadedmetadata = () => {
            URL.revokeObjectURL(url)
            resolve(Math.round(audio.duration) || 0)
          }
          audio.onerror = () => {
            URL.revokeObjectURL(url)
            resolve(0)
          }
          audio.src = url
          setTimeout(() => resolve(0), 1500)
        })
      } catch {
        duration = 0
      }
    }

    try {
      let downloadURL = ''
      let trackId = `${user.uid}-${Date.now()}`

      try {
        // Attempt Firebase Storage upload with explicit contentType
        const storageRef = ref(storage, `audio/${user.uid}/${Date.now()}-${sanitizedName}`)
        const uploadTask: UploadTask = uploadBytesResumable(storageRef, file, { contentType })

        // Track progress with an explicit 12-second timeout to abort hanging retries
        await new Promise<void>((resolve, reject) => {
          let timeoutTimer: ReturnType<typeof setTimeout> | null = null

          const cleanup = () => {
            if (timeoutTimer) {
              clearTimeout(timeoutTimer)
              timeoutTimer = null
            }
          }

          timeoutTimer = setTimeout(() => {
            try {
              uploadTask.cancel()
            } catch {
              // ignore cancel error
            }
            cleanup()
            reject(new Error('Firebase Storage timeout: falling back to local audio stream'))
          }, 12000)

          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              setUploadProgress((prev) => ({
                ...prev,
                [fileId]: Math.round(progress),
              }))
            },
            (error) => {
              cleanup()
              reject(error)
            },
            () => {
              cleanup()
              resolve()
            },
          )
        })

        downloadURL = await getDownloadURL(storageRef)

        // Save metadata to Firestore
        const trackDoc: DocumentReference = await addDoc(tracksCollection, {
          title: metadata?.title || file.name.replace(/\.[^/.]+$/, ''),
          artist: metadata?.artist || user.displayName || 'Unknown Artist',
          album: metadata?.album || 'My Uploads',
          duration: duration,
          audioUrl: downloadURL,
          coverUrl: metadata?.coverUrl || user.photoURL || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80',
          ownerId: user.uid,
          isPublic: false,
          lyricsStatus: 'pending',
          lyrics: metadata?.lyrics || [],
          createdAt: serverTimestamp(),
        })
        trackId = trackDoc.id
      } catch (cloudErr) {
        console.warn('Firebase Cloud Storage fallback to local playable audio stream:', cloudErr)
        downloadURL = URL.createObjectURL(file)

        // Attempt saving track document to Firestore so metadata persists
        try {
          const trackDoc: DocumentReference = await addDoc(tracksCollection, {
            title: metadata?.title || file.name.replace(/\.[^/.]+$/, ''),
            artist: metadata?.artist || user.displayName || 'Unknown Artist',
            album: metadata?.album || 'My Uploads',
            duration: duration,
            audioUrl: downloadURL,
            coverUrl: metadata?.coverUrl || user.photoURL || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80',
            ownerId: user.uid,
            isPublic: false,
            lyricsStatus: 'pending',
            lyrics: metadata?.lyrics || [],
            createdAt: serverTimestamp(),
          })
          trackId = trackDoc.id
        } catch {
          // Keep local trackId if Firestore write also encounters an error
        }
      }

      const newTrack: Track = {
        id: trackId,
        title: metadata?.title || file.name.replace(/\.[^/.]+$/, ''),
        artist: metadata?.artist || user.displayName || 'Unknown Artist',
        album: metadata?.album || 'My Uploads',
        duration: duration,
        audioUrl: downloadURL,
        coverUrl: metadata?.coverUrl || user.photoURL || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80',
        ownerId: user.uid,
        lyrics: metadata?.lyrics || [],
      }

      addTrack(newTrack)
      setUserTracks((prev) => [newTrack, ...prev.filter((t) => t.id !== newTrack.id)])
      setError(null)
      return trackId
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
