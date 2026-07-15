import { useEffect, useRef } from 'react'
import { useAudioStore } from '../store/audioStore'

// Sample lyrics in LRC format for demonstration
const SAMPLE_LYRICS_MAP: Record<string, string> = {
  'After the Power Dies': `[00:00.00]In the silence of the end
[00:05.50]When the light begins to bend
[00:10.80]All the echoes fade away
[00:16.20]In the darkness of the day
[00:21.45]We are standing at the gate
[00:27.00]Of a world we didn't make
[00:32.30]Feel the moment slip away
[00:37.80]As the power dies away`,

  'Night Drive': `[00:00.00]City lights are moving slow
[00:05.50]Midnight humming through the road
[00:10.80]Your voice echoes with the bass
[00:16.20]We fade into a brighter place
[00:21.45]Neon signs along the way
[00:27.00]Guide us through the break of day
[00:32.30]Feel the rhythm in your soul
[00:37.80]Let the music make you whole`,

  'Glass Horizon': `[00:00.00]Crystal walls of diamond light
[00:05.50]Shattered by the morning bright
[00:10.80]Reflection of a distant dream
[00:16.20]Nothing's ever what it seems
[00:21.45]Standing at the edge of time
[00:27.00]Where the future calls to mine
[00:32.30]Glass horizon breaks apart
[00:37.80]Echoes calling to my heart`,
}

function generateDefaultLyrics(trackTitle: string, duration: number) {
  // Check if we have predefined lyrics
  if (SAMPLE_LYRICS_MAP[trackTitle]) {
    return parseLRC(SAMPLE_LYRICS_MAP[trackTitle])
  }

  // Generate generic lyrics based on duration
  const lines = []
  const lineCount = Math.floor(duration / 5)

  for (let i = 0; i < lineCount; i++) {
    const time = i * 5
    const genericLyrics = [
      'Feel the rhythm in your soul',
      'Let the music guide your way',
      'Colors dancing in the night',
      'Take me to a higher place',
      'Echoes of a distant sound',
      'Moving through infinity',
      'Lights are shining all around',
      'Gravity is pulling me',
    ]

    lines.push({
      time,
      text: genericLyrics[i % genericLyrics.length],
    })
  }

  return lines
}

function parseLRC(lrcContent: string) {
  const lines = lrcContent.split('\n')
  const lyrics = []

  for (const line of lines) {
    const match = line.match(/\[(\d+):(\d+\.\d+)\](.*)/);
    if (match) {
      const minutes = parseInt(match[1], 10)
      const seconds = parseFloat(match[2])
      const time = minutes * 60 + seconds
      const text = match[3].trim()

      if (text) {
        lyrics.push({ time, text })
      }
    }
  }

  return lyrics
}

export function useLyricsExtraction() {
  const { tracks, setTracks } = useAudioStore()
  const processedRef = useRef(false)

  useEffect(() => {
    // Safety check
    if (!tracks || tracks.length === 0) {
      console.log('[Lyrics] No tracks to process yet')
      return
    }

    // Prevent processing multiple times
    if (processedRef.current) {
      console.log('[Lyrics] Already processed, skipping')
      return
    }

    console.log(`[Lyrics] Starting extraction for ${tracks.length} tracks`)

    try {
      // Generate lyrics for all tracks that don't have them
      const updatedTracks = tracks.map((track) => {
        // Skip if already has lyrics
        if (track.lyrics && Array.isArray(track.lyrics) && track.lyrics.length > 0) {
          return track
        }

        // Generate new lyrics
        const generatedLyrics = generateDefaultLyrics(track.title, track.duration)
        console.log(`[Lyrics] Generated ${generatedLyrics.length} lines for "${track.title}"`)
        
        return {
          ...track,
          lyrics: generatedLyrics,
          lyricsStatus: 'completed' as const,
        }
      })

      // Log summary
      const lyricsCount = updatedTracks.filter(t => t.lyrics && t.lyrics.length > 0).length
      console.log(`[Lyrics] Successfully populated lyrics for ${lyricsCount}/${updatedTracks.length} tracks`)

      // Update store
      setTracks(updatedTracks)
      processedRef.current = true
    } catch (error) {
      console.error('[Lyrics] Error during extraction:', error)
    }
  }, [tracks.length])
}

// Hook to fetch actual lyrics from your lyrics service (when available)
export function useLyricsService() {
  const callLyricsService = async (audioUrl: string, trackId: string) => {
    try {
      // This would call your Python lyrics service endpoint
      const response = await fetch('/api/lyrics/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioUrl, trackId }),
      })

      if (!response.ok) {
        throw new Error('Failed to extract lyrics')
      }

      const { lyrics } = await response.json()
      return lyrics
    } catch (error) {
      console.error('Error calling lyrics service:', error)
      return []
    }
  }

  return { callLyricsService }
}
