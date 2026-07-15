import { useCallback, useEffect, useState } from 'react'
import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  arrayRemove,
} from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import type { Playlist } from '../types'

export function usePlaylists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(false)

  const currentUser = auth.currentUser

  // Load user's playlists
  useEffect(() => {
    if (!currentUser) {
      setPlaylists([])
      return
    }

    const loadPlaylists = async () => {
      setLoading(true)
      try {
        const playlistsQuery = query(
          collection(db, 'playlists'),
          where('createdBy', '==', currentUser.uid),
        )
        const snapshot = await getDocs(playlistsQuery)

        const playlistsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Playlist[]

        setPlaylists(playlistsList)
      } catch (err) {
        console.error('Failed to load playlists:', err)
      } finally {
        setLoading(false)
      }
    }

    void loadPlaylists()
  }, [currentUser])

  const createPlaylist = useCallback(
    async (name: string, description: string, isPublic: boolean): Promise<string | null> => {
      if (!currentUser) return null

      try {
        const docRef = await addDoc(collection(db, 'playlists'), {
          name,
          description,
          createdBy: currentUser.uid,
          isPublic,
          isSystemGenerated: false,
          trackIds: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })

        const newPlaylist: Playlist = {
          id: docRef.id,
          name,
          description,
          createdBy: currentUser.uid,
          isPublic,
          isSystemGenerated: false,
          trackIds: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }

        setPlaylists((prev) => [...prev, newPlaylist])
        return docRef.id
      } catch (err) {
        console.error('Failed to create playlist:', err)
        return null
      }
    },
    [currentUser],
  )

  const deletePlaylist = useCallback(
    async (playlistId: string) => {
      if (!currentUser) return

      try {
        await deleteDoc(doc(db, 'playlists', playlistId))
        setPlaylists((prev) => prev.filter((p) => p.id !== playlistId))
      } catch (err) {
        console.error('Failed to delete playlist:', err)
      }
    },
    [currentUser],
  )

  const addTrackToPlaylist = useCallback(
    async (playlistId: string, trackId: string) => {
      if (!currentUser) return

      try {
        const playlistRef = doc(db, 'playlists', playlistId)
        await updateDoc(playlistRef, {
          trackIds: arrayUnion(trackId),
          updatedAt: serverTimestamp(),
        })

        setPlaylists((prev) =>
          prev.map((p) =>
            p.id === playlistId
              ? { ...p, trackIds: [...p.trackIds, trackId], updatedAt: Date.now() }
              : p,
          ),
        )
      } catch (err) {
        console.error('Failed to add track to playlist:', err)
      }
    },
    [currentUser],
  )

  const removeTrackFromPlaylist = useCallback(
    async (playlistId: string, trackId: string) => {
      if (!currentUser) return

      try {
        const playlistRef = doc(db, 'playlists', playlistId)
        await updateDoc(playlistRef, {
          trackIds: arrayRemove(trackId),
          updatedAt: serverTimestamp(),
        })

        setPlaylists((prev) =>
          prev.map((p) =>
            p.id === playlistId
              ? { ...p, trackIds: p.trackIds.filter((id) => id !== trackId), updatedAt: Date.now() }
              : p,
          ),
        )
      } catch (err) {
        console.error('Failed to remove track from playlist:', err)
      }
    },
    [currentUser],
  )

  const isTrackInPlaylist = useCallback(
    (playlistId: string, trackId: string): boolean => {
      const playlist = playlists.find((p) => p.id === playlistId)
      return playlist?.trackIds.includes(trackId) ?? false
    },
    [playlists],
  )

  return {
    playlists,
    loading,
    createPlaylist,
    deletePlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    isTrackInPlaylist,
    isAuthenticated: !!currentUser,
  }
}
