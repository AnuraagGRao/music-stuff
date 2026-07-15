import { ThumbsDown, ThumbsUp } from 'lucide-react'
import type { Track } from '../types'
import { useVoting } from '../hooks/useVoting'

type VotingButtonsProps = {
  track: Track
  onAuthRequired?: () => void
}

export function VotingButtons({ track, onAuthRequired }: VotingButtonsProps) {
  const { toggleVote, getUserVote, loading, isAuthenticated } = useVoting()

  const userVote = getUserVote(track.id)
  const upvotes = track.upvotesCount ?? 0
  const downvotes = track.downvotesCount ?? 0

  const handleVote = (voteType: 'up' | 'down') => {
    if (!isAuthenticated) {
      onAuthRequired?.()
      return
    }

    void toggleVote(track.id, voteType)
  }

  return (
    <div className="flex items-center gap-3 text-xs">
      <button
        type="button"
        onClick={() => handleVote('up')}
        disabled={loading}
        className={`flex items-center gap-1 rounded-md px-2 py-1 transition ${
          userVote === 'up'
            ? 'bg-emerald-500/20 text-emerald-400'
            : 'hover:bg-white/10 text-slate-400'
        } disabled:opacity-50`}
        title="Upvote"
      >
        <ThumbsUp className="size-3.5" />
        <span>{upvotes > 0 ? upvotes : ''}</span>
      </button>

      <button
        type="button"
        onClick={() => handleVote('down')}
        disabled={loading}
        className={`flex items-center gap-1 rounded-md px-2 py-1 transition ${
          userVote === 'down'
            ? 'bg-rose-500/20 text-rose-400'
            : 'hover:bg-white/10 text-slate-400'
        } disabled:opacity-50`}
        title="Downvote"
      >
        <ThumbsDown className="size-3.5" />
        <span>{downvotes > 0 ? downvotes : ''}</span>
      </button>
    </div>
  )
}
