import type { LyricLine } from '../types'

type LyricsViewProps = {
  lyrics: LyricLine[]
  currentTime: number
}

export function LyricsView({ lyrics, currentTime }: LyricsViewProps) {
  return (
    <section className="glass-panel h-72 overflow-y-auto p-4">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-300">Live Lyrics</h2>
      <div className="space-y-3">
        {lyrics.map((line, index) => {
          const nextTime = lyrics[index + 1]?.time ?? Number.MAX_SAFE_INTEGER
          const isActive = currentTime >= line.time && currentTime < nextTime
          return (
            <p
              key={`${line.time}-${line.text}`}
              className={`transition ${isActive ? 'scale-[1.01] text-base font-semibold text-white' : 'text-slate-400'}`}
            >
              {line.text}
            </p>
          )
        })}
      </div>
    </section>
  )
}
