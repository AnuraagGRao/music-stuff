import { useEffect, useRef } from 'react'
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Track } from '../types'

interface PublicTrackManifest {
  tracks: Array<{
    id: string
    title: string
    artist: string
    album: string
    duration: number
    audioUrl: string
    coverUrl: string
    ownerId: string
    isPublic: boolean
    lyricsStatus: string
    upvotesCount: number
    downvotesCount: number
    netScore: number
  }>
}

export function useSeedDatabase() {
  const seededRef = useRef(false)

  useEffect(() => {
    if (seededRef.current) return

    const seedDatabase = async () => {
      try {
        // Fetch the manifest
        const response = await fetch('/publicManifest.json')
        if (!response.ok) {
          console.error('Failed to fetch publicManifest.json')
          return
        }

        const manifest: PublicTrackManifest = await response.json()
        const tracksRef = collection(db, 'tracks')

        // Check for each track if it already exists
        for (const trackData of manifest.tracks) {
          const existingQuery = query(
            tracksRef,
            where('title', '==', trackData.title),
            where('artist', '==', trackData.artist),
            where('isPublic', '==', true)
          )
          const existingSnapshot = await getDocs(existingQuery)

          // Skip if track already exists
          if (!existingSnapshot.empty) {
            continue
          }

          // Add new track
          const trackToSeed: Track = {
            id: trackData.id,
            title: trackData.title,
            artist: trackData.artist,
            album: trackData.album,
            duration: trackData.duration,
            audioUrl: trackData.audioUrl,
            coverUrl: trackData.coverUrl,
            ownerId: trackData.ownerId,
            isPublic: trackData.isPublic,
            lyricsStatus: trackData.lyricsStatus as 'pending' | 'completed' | 'failed',
            upvotesCount: trackData.upvotesCount,
            downvotesCount: trackData.downvotesCount,
            netScore: trackData.netScore,
            createdAt: serverTimestamp(),
            lyrics: []
          }

          await addDoc(tracksRef, trackToSeed)
        }

        seededRef.current = true
        console.log(`Seeding complete: ${manifest.tracks.length} tracks processed`)
      } catch (error) {
        console.error('Error seeding database:', error)
      }
    }

    seedDatabase()
  }, [])
}
