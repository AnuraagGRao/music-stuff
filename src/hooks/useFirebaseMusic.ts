import { useMemo, useState } from 'react'
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'
import { auth, db, storage } from '../lib/firebase'

export function useFirebaseMusic() {
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const user = auth.currentUser
  const uploadsCollection = useMemo(() => collection(db, 'tracks'), [])

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
  }

  const logout = async () => {
    await signOut(auth)
  }

  const uploadTrack = async (file: File) => {
    if (!user) throw new Error('Sign in required')

    setIsUploading(true)
    const objectRef = ref(storage, `audio/${user.uid}/${Date.now()}-${file.name}`)
    const task = uploadBytesResumable(objectRef, file)

    await new Promise<void>((resolve, reject) => {
      task.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          setUploadProgress(Math.round(progress))
        },
        reject,
        resolve,
      )
    })

    const downloadURL = await getDownloadURL(objectRef)

    await addDoc(uploadsCollection, {
      ownerId: user.uid,
      title: file.name,
      audioUrl: downloadURL,
      status: 'processing',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    setIsUploading(false)
    setUploadProgress(0)
  }

  return { user, loginWithGoogle, logout, uploadTrack, uploadProgress, isUploading }
}
