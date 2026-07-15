import { useEffect } from 'react'
import { collection, getDocs, setDoc, doc, query, where } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Track } from '../types'

export function useInitializePublicTracks() {
  useEffect(() => {
    const initializePublicTracks = async () => {
      try {
        // Check if public tracks already exist
        const publicTracksQuery = query(collection(db, 'tracks'), where('isPublic', '==', true))
        const snapshot = await getDocs(publicTracksQuery)

        if (snapshot.size > 0) {
          // Public tracks already exist, skip seeding
          return
        }

        // Fetch the manifest
        const response = await fetch('/publicManifest.json')
        if (!response.ok) {
          console.warn('Failed to load public manifest')
          return
        }

        const manifest = (await response.json()) as { tracks: Track[] }

        // Seed each track
        for (const track of manifest.tracks) {
          const trackRef = doc(db, 'tracks', track.id)
          await setDoc(trackRef, {
            title: track.title,
            artist: track.artist,
            album: track.album,
            duration: track.duration,
            audioUrl: track.audioUrl,
            coverUrl: track.coverUrl,
            ownerId: track.ownerId,
            isPublic: true,
            lyricsStatus: 'completed',
            upvotesCount: 0,
            downvotesCount: 0,
            netScore: 0,
            createdAt: Date.now(),
          })
        }

        console.log('Public tracks initialized successfully')
      } catch (err) {
        console.error('Failed to initialize public tracks:', err)
      }
    }

    void initializePublicTracks()
  }, [])
}
