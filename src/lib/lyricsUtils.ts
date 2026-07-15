import type { LyricLine } from '../types'

const APPRECIATION_PATTERNS = [
  'thank you',
  'thanks for watching',
  'thanks for listening',
  'appreciate',
  'subscribe',
  'like and subscribe',
]

const HALLUCINATION_PATTERNS = [
  // Repeated syllables (e.g., "o-o-o-o-o", "ba-ba-ba")
  // Detected separately with regex
  
  // YouTube/Platform artifacts
  'click here',
  'follow us',
  'visit us',
  '[music]',
  '[silence]',
  '[background noise]',
  '[applause]',
  'applause',
]

/**
 * Check if text appears to be a hallucination (even without appreciation messages)
 * Catches patterns like "o-o-o-o-o", "ba-ba-ba", etc.
 */
export function isHallucination(text: string): boolean {
  const lowerText = text.toLowerCase().trim()

  // Check against known hallucination patterns
  if (HALLUCINATION_PATTERNS.some(pattern => lowerText.includes(pattern))) {
    return true
  }

  // Check for repeated syllable pattern: char-char-char-char (3+ repetitions)
  // Matches: "o-o-o-o", "ba-ba-ba-ba", "la-la-la-la", etc.
  const repeatedSyllableRegex = /^([a-z]+-)(\1)+$/
  if (repeatedSyllableRegex.test(lowerText)) {
    return true
  }

  return false
}

/**
 * Check if a lyric line is an appreciation message
 */
export function isAppreciationMessage(text: string): boolean {
  const lowerText = text.toLowerCase()
  return APPRECIATION_PATTERNS.some(pattern => lowerText.includes(pattern))
}

/**
 * Check if all meaningful lyrics are appreciation messages or hallucinations (instrumental track)
 */
export function isInstrumentalTrack(lyrics: LyricLine[]): boolean {
  if (!lyrics || lyrics.length === 0) return true

  const meaningfulLyrics = lyrics.filter(lyric => lyric.text.trim().length > 0)

  if (meaningfulLyrics.length === 0) return true

  // Filter out appreciation messages and hallucinations
  const validLyrics = meaningfulLyrics.filter(lyric => {
    const text = lyric.text
    return !isAppreciationMessage(text) && !isHallucination(text)
  })

  // If more than 90% were filtered out, consider it instrumental
  // (was appreciation + hallucinations, not real lyrics)
  return validLyrics.length / meaningfulLyrics.length < 0.1
}

/**
 * Filter out appreciation messages and hallucinations from lyrics
 * If a line is ONLY appreciation/hallucination, remove it entirely
 * If a line contains appreciation + content, remove just the appreciation part
 */
export function filterAppreciationFromLyrics(lyrics: LyricLine[]): LyricLine[] {
  return lyrics
    .filter(lyric => !isHallucination(lyric.text))
    .map(lyric => {
      if (isAppreciationMessage(lyric.text)) {
        // Check if this line has content beyond appreciation
        let filtered = lyric.text

        // Remove common appreciation patterns
        filtered = filtered.replace(/thank\s+you\s+for\s+watching\s+this\s+video.*$/gi, '')
        filtered = filtered.replace(/thank\s+you\s+for\s+listening.*$/gi, '')
        filtered = filtered.replace(/thanks?\s+for.*$/gi, '')
        filtered = filtered.replace(/subscribe\s+for.*$/gi, '')
        filtered = filtered.replace(/like\s+and\s+subscribe.*$/gi, '')
        filtered = filtered.replace(/i['']?ll\s+see\s+you\s+in\s+the\s+next.*$/gi, '')

        filtered = filtered.trim()

        // If nothing meaningful left, return null (will be filtered out)
        if (!filtered || filtered.length < 5) {
          return null
        }

        // Otherwise return cleaned version
        return { ...lyric, text: filtered }
      }

      return lyric
    })
    .filter((lyric): lyric is LyricLine => lyric !== null)
}
