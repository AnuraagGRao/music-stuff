import { useEffect, useState } from 'react'
import { Moon, Check, X, Clock } from 'lucide-react'
import { useAudioStore } from '../store/audioStore'

interface SleepTimerModalProps {
  isOpen: boolean
  onClose: () => void
}

const TIMER_OPTIONS = [
  { label: '15 Minutes', minutes: 15, isEndOfTrack: false },
  { label: '30 Minutes', minutes: 30, isEndOfTrack: false },
  { label: '45 Minutes', minutes: 45, isEndOfTrack: false },
  { label: '1 Hour', minutes: 60, isEndOfTrack: false },
  { label: 'End of Track', minutes: null, isEndOfTrack: true },
]

export function SleepTimerModal({ isOpen, onClose }: SleepTimerModalProps) {
  const { sleepTimerMinutes, sleepTimerExpiresAt, isSleepTimerEndOfTrack, setSleepTimer } = useAudioStore()
  const [timeLeft, setTimeLeft] = useState<string | null>(null)

  useEffect(() => {
    if (!sleepTimerExpiresAt) {
      setTimeLeft(null)
      return
    }

    const updateTimeLeft = () => {
      const remainingMs = sleepTimerExpiresAt - Date.now()
      if (remainingMs <= 0) {
        setTimeLeft(null)
        return
      }
      const mins = Math.ceil(remainingMs / (60 * 1000))
      setTimeLeft(`${mins}m remaining`)
    }

    updateTimeLeft()
    const interval = setInterval(updateTimeLeft, 5000)
    return () => clearInterval(interval)
  }, [sleepTimerExpiresAt])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-sm rounded-2xl bg-[#0e0f14] border border-white/[0.1] p-5 shadow-2xl z-10 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
              <Moon className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Sleep Timer</h3>
              <p className="text-[0.7rem] text-slate-400">Automatically pause playback</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-md transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Active Timer Pill if set */}
        {(sleepTimerExpiresAt || isSleepTimerEndOfTrack) && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs">
            <div className="flex items-center gap-2">
              <Clock className="size-3.5 animate-pulse" />
              <span>
                {isSleepTimerEndOfTrack ? 'Stopping at end of current track' : `Active: ${timeLeft || 'Less than a minute'}`}
              </span>
            </div>
            <button
              onClick={() => setSleepTimer(null)}
              className="text-xs font-semibold text-rose-400 hover:underline cursor-pointer"
            >
              Turn Off
            </button>
          </div>
        )}

        {/* Timer Options List */}
        <div className="space-y-1.5">
          {TIMER_OPTIONS.map((opt) => {
            const isSelected =
              opt.isEndOfTrack
                ? isSleepTimerEndOfTrack
                : sleepTimerMinutes === opt.minutes

            return (
              <button
                key={opt.label}
                onClick={() => {
                  setSleepTimer(opt.minutes, opt.isEndOfTrack)
                  onClose()
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-500 text-white font-bold shadow-md shadow-indigo-500/20'
                    : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <Check className="size-4" />}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
