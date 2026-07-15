import { useEffect, useRef, useMemo } from 'react'
import { findActiveLyricIndex } from '../lib/lrcParser'
import { filterAppreciationFromLyrics } from '../lib/lyricsUtils'
import type { LyricLine } from '../types'

type LyricsViewProps = {
  lyrics: LyricLine[]
  currentTime: number
}

export function LyricsView({ lyrics, currentTime }: LyricsViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const activeLyricRef = useRef<HTMLParagraphElement>(null)

  // Filter out appreciation messages
  const filteredLyrics = useMemo(() => {
    if (!lyrics || lyrics.length === 0) return []
    return filterAppreciationFromLyrics(lyrics)
  }, [lyrics])

  const activeLyricIndex = findActiveLyricIndex(filteredLyrics, currentTime)

  // Auto-scroll to active lyric with improved positioning
  useEffect(() => {
    if (activeLyricRef.current && containerRef.current) {
      const container = containerRef.current
      const activeElement = activeLyricRef.current

      // Scroll active element to top-third of container
      const scrollTarget = activeElement.offsetTop - (container.clientHeight * 0.3)
      
      // Smooth scroll
      container.scrollTo({
        top: Math.max(0, scrollTarget),
        behavior: 'smooth'
      })
    }
  }, [activeLyricIndex, filteredLyrics.length])

  if (!filteredLyrics || filteredLyrics.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-64">
        <p className="text-center text-sm text-slate-400">No lyrics available for this track</p>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="space-y-3 pr-2 overflow-y-auto max-h-full">
      {filteredLyrics.map((line, index) => {
        const isActive = index === activeLyricIndex
        return (
          <p
            key={`${line.time}-${index}`}
            ref={isActive ? activeLyricRef : null}
            className={`transition-all duration-200 text-sm leading-relaxed break-words ${
              isActive
                ? 'scale-105 text-base font-semibold text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.5)]'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            {line.text}
          </p>
        )
      })}
    </div>
  )
}
