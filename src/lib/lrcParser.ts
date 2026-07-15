import type { LyricLine } from '../types'

/**
 * Parses LRC format lyrics into LyricLine array
 * LRC format: [mm:ss.cc]text
 * @param lrcContent - Raw LRC file content
 * @returns Array of LyricLine objects
 */
export function parseLRC(lrcContent: string): LyricLine[] {
  const lines = lrcContent.split('\n')
  const lyrics: LyricLine[] = []

  for (const line of lines) {
    // Match LRC timestamp format: [mm:ss.cc] or [mm:ss]
    const match = line.match(/^\[(\d+):(\d+)(?:\.(\d+))?\](.*)$/)

    if (match) {
      const [, minutes, seconds, centiseconds, text] = match
      const totalSeconds = parseInt(minutes) * 60 + parseInt(seconds) + (centiseconds ? parseInt(centiseconds) / 100 : 0)

      if (text.trim()) {
        lyrics.push({
          time: Math.round(totalSeconds * 100) / 100, // Round to 2 decimal places
          text: text.trim(),
        })
      }
    }
  }

  // Sort by time in case they're not in order
  return lyrics.sort((a, b) => a.time - b.time)
}

/**
 * Finds the active lyric line based on current playback time
 * Shows the lyric that is closest to but not after the current time
 * with a small grace period to account for timing differences
 * @param lyrics - Array of lyric lines
 * @param currentTime - Current playback time in seconds
 * @returns Index of the active lyric line, or -1 if none
 */
export function findActiveLyricIndex(lyrics: LyricLine[], currentTime: number): number {
  if (!lyrics || lyrics.length === 0) return -1

  // Add a small grace period (200ms) to handle timing inconsistencies
  const gracePeriod = 0.2
  const adjustedTime = currentTime + gracePeriod

  // Find the last lyric whose time is <= adjusted time
  for (let i = lyrics.length - 1; i >= 0; i--) {
    if (lyrics[i].time <= adjustedTime) {
      return i
    }
  }

  return -1
}

/**
 * Converts lyrics array back to LRC format
 * @param lyrics - Array of lyric lines
 * @returns LRC formatted string
 */
export function toLRC(lyrics: LyricLine[]): string {
  return lyrics
    .map((lyric) => {
      const minutes = Math.floor(lyric.time / 60)
      const seconds = Math.floor(lyric.time % 60)
      const centiseconds = Math.round((lyric.time % 1) * 100)

      const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`
      return `[${timeStr}]${lyric.text}`
    })
    .join('\n')
}

/**
 * Example LRC content
 */
export const EXAMPLE_LRC = `[00:00.00]City lights are moving slow
[00:12.50]Midnight humming through the road
[00:25.00]Your voice echoes with the bass
[00:39.00]We fade into a brighter place`
