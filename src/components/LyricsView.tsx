import { useEffect, useRef, useMemo } from 'react'
import { Music2 } from 'lucide-react'
import { findActiveLyricIndex } from '../lib/lrcParser'
import { filterAppreciationFromLyrics } from '../lib/lyricsUtils'
import type { LyricLine } from '../types'

type LyricsViewProps = {
  lyrics: LyricLine[]
  currentTime: number
  onSeek?: (time: number) => void
  size?: 'normal' | 'large'
}

export function LyricsView({ lyrics, currentTime, onSeek, size = 'large' }: LyricsViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const activeLyricRef = useRef<HTMLDivElement>(null)

  // Filter out appreciation messages and empty artifacts
  const filteredLyrics = useMemo(() => {
    if (!lyrics || lyrics.length === 0) return []
    return filterAppreciationFromLyrics(lyrics)
  }, [lyrics])

  const activeLyricIndex = findActiveLyricIndex(filteredLyrics, currentTime)

  // Auto-scroll to active lyric keeping it centered
  useEffect(() => {
    if (activeLyricRef.current && containerRef.current) {
      const container = containerRef.current
      const activeEl = activeLyricRef.current

      const scrollTarget = activeEl.offsetTop - container.clientHeight / 2 + activeEl.clientHeight / 2
      container.scrollTo({
        top: Math.max(0, scrollTarget),
        behavior: 'smooth',
      })
    }
  }, [activeLyricIndex, filteredLyrics.length])

  if (!filteredLyrics || filteredLyrics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-48 text-center p-6 gap-2">
        <Music2 className="size-8 text-slate-600 animate-pulse" />
        <p className="text-base font-semibold text-white/70">Instrumental Audio</p>
        <p className="text-xs text-slate-400 max-w-xs">
          No synchronized vocal lyrics for this track. Enjoy the music!
        </p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="space-y-4 px-3 py-6 overflow-y-auto max-h-full scroll-smooth select-none"
    >
      {filteredLyrics.map((line, index) => {
        const isActive = index === activeLyricIndex
        return (
          <div
            key={`${line.time}-${index}`}
            ref={isActive ? activeLyricRef : null}
            onClick={() => onSeek && onSeek(line.time)}
            className={`group transition-all duration-300 rounded-xl p-2.5 cursor-pointer ${
              isActive
                ? 'bg-white/[0.08] translate-x-1'
                : 'hover:bg-white/[0.03]'
            }`}
          >
            <p
              className={`leading-relaxed break-words transition-all duration-300 ${
                size === 'large' ? 'text-lg sm:text-2xl' : 'text-base sm:text-lg'
              } ${
                isActive
                  ? 'font-bold text-white drop-shadow-[0_2px_16px_rgba(255,255,255,0.45)]'
                  : 'font-medium text-white/35 group-hover:text-white/80'
              }`}
            >
              {line.text}
            </p>
          </div>
        )
      })}
    </div>
  )
}
