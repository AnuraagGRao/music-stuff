import type { Track } from '../types'

type QueueProps = {
  title: string
  ids: string[]
  tracks: Track[]
}

export function Queue({ title, ids, tracks }: QueueProps) {
  const resolved = ids
    .map((id) => tracks.find((track) => track.id === id))
    .filter((track): track is Track => Boolean(track))

  return (
    <section className="glass-panel p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">{title}</h2>
      <ul className="space-y-2">
        {resolved.length ? (
          resolved.map((track) => (
            <li key={track.id} className="truncate text-sm text-slate-200">
              {track.title} <span className="text-slate-400">• {track.artist}</span>
            </li>
          ))
        ) : (
          <li className="text-sm text-slate-400">Nothing here yet.</li>
        )}
      </ul>
    </section>
  )
}
