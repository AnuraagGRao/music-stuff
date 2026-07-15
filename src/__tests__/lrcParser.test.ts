import { describe, it, expect } from 'vitest'
import { parseLRC, findActiveLyricIndex, toLRC } from '../src/lib/lrcParser'

describe('LRC Parser', () => {
  const sampleLRC = `[00:00.00]City lights are moving slow
[00:12.50]Midnight humming through the road
[00:25.00]Your voice echoes with the bass
[00:39.00]We fade into a brighter place`

  describe('parseLRC', () => {
    it('should parse LRC format correctly', () => {
      const result = parseLRC(sampleLRC)

      expect(result).toHaveLength(4)
      expect(result[0]).toEqual({ time: 0, text: 'City lights are moving slow' })
      expect(result[1]).toEqual({ time: 12.5, text: 'Midnight humming through the road' })
      expect(result[2]).toEqual({ time: 25, text: 'Your voice echoes with the bass' })
      expect(result[3]).toEqual({ time: 39, text: 'We fade into a brighter place' })
    })

    it('should handle LRC format without centiseconds', () => {
      const lrc = `[00:15]First line
[00:30]Second line`

      const result = parseLRC(lrc)

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({ time: 15, text: 'First line' })
      expect(result[1]).toEqual({ time: 30, text: 'Second line' })
    })

    it('should handle empty lines and non-lyric content', () => {
      const lrc = `[ar:Test Artist]
[ti:Test Title]

[00:00.00]First line

[00:15.00]Second line`

      const result = parseLRC(lrc)

      // Should only include lines with lyrics (not metadata)
      expect(result.length).toBeGreaterThan(0)
      expect(result[0]?.text).toBe('First line')
    })

    it('should sort lyrics by time', () => {
      const lrc = `[00:30.00]Second
[00:15.00]First
[00:45.00]Third`

      const result = parseLRC(lrc)

      expect(result[0]?.text).toBe('First')
      expect(result[1]?.text).toBe('Second')
      expect(result[2]?.text).toBe('Third')
    })

    it('should handle multi-digit minutes', () => {
      const lrc = `[03:45.50]Lyric at 3:45`

      const result = parseLRC(lrc)

      expect(result[0]?.time).toBe(225.5) // 3*60 + 45 + 0.5
    })

    it('should trim whitespace from lyrics', () => {
      const lrc = `[00:00.00]  Lyric with spaces  
[00:15.00]\tLyric with tab`

      const result = parseLRC(lrc)

      expect(result[0]?.text).toBe('Lyric with spaces')
      expect(result[1]?.text).toBe('Lyric with tab')
    })
  })

  describe('findActiveLyricIndex', () => {
    const lyrics = [
      { time: 0, text: 'Start' },
      { time: 10, text: 'Middle' },
      { time: 20, text: 'End' },
    ]

    it('should return correct index for active lyric', () => {
      expect(findActiveLyricIndex(lyrics, 0)).toBe(0)
      expect(findActiveLyricIndex(lyrics, 5)).toBe(0)
      expect(findActiveLyricIndex(lyrics, 10)).toBe(1)
      expect(findActiveLyricIndex(lyrics, 15)).toBe(1)
      expect(findActiveLyricIndex(lyrics, 20)).toBe(2)
    })

    it('should return -1 when no lyric is active', () => {
      expect(findActiveLyricIndex(lyrics, -1)).toBe(-1)
    })

    it('should handle empty lyrics array', () => {
      expect(findActiveLyricIndex([], 10)).toBe(-1)
    })

    it('should return last lyric when currentTime exceeds all lyrics', () => {
      expect(findActiveLyricIndex(lyrics, 1000)).toBe(2)
    })
  })

  describe('toLRC', () => {
    it('should convert lyrics back to LRC format', () => {
      const lyrics = [
        { time: 0, text: 'First line' },
        { time: 12.5, text: 'Second line' },
        { time: 25.75, text: 'Third line' },
      ]

      const result = toLRC(lyrics)

      expect(result).toContain('[00:00.00]First line')
      expect(result).toContain('[00:12.50]Second line')
      expect(result).toContain('[00:25.75]Third line')
    })

    it('should handle multi-digit minutes in toLRC', () => {
      const lyrics = [{ time: 125.5, text: 'Test' }] // 2 minutes 5.5 seconds

      const result = toLRC(lyrics)

      expect(result).toContain('[02:05.50]Test')
    })

    it('should be reversible (parse -> toLRC -> parse)', () => {
      const original = parseLRC(sampleLRC)
      const lrcFormat = toLRC(original)
      const reparsed = parseLRC(lrcFormat)

      // Compare times and texts
      expect(reparsed.length).toBe(original.length)
      for (let i = 0; i < original.length; i++) {
        expect(Math.abs(reparsed[i]!.time - original[i]!.time)).toBeLessThan(0.01) // Allow small floating point differences
        expect(reparsed[i]?.text).toBe(original[i]?.text)
      }
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty LRC string', () => {
      const result = parseLRC('')
      expect(result).toEqual([])
    })

    it('should handle LRC with only metadata', () => {
      const lrc = `[ar:Artist Name]
[ti:Song Title]
[al:Album Name]`

      const result = parseLRC(lrc)
      expect(result).toEqual([])
    })

    it('should handle very long timestamps', () => {
      const lrc = `[59:59.99]Almost an hour`

      const result = parseLRC(lrc)

      expect(result[0]?.time).toBe(3599.99)
    })
  })
})
