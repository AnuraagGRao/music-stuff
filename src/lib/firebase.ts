import { initializeApp, getApps } from 'firebase/app'
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDRbx1dPMQn7msK3ihrF0WnSPL5Jc3liY4',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'music-stuff-7420.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'music-stuff-7420',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'music-stuff-7420.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '168475522535',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:168475522535:web:126d3cc7f1795e52017942',
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Set persistence for auth
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn('Failed to set auth persistence:', err)
})
