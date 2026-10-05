import { X, Command } from 'lucide-react'

interface KeyboardShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
}

const SHORTCUTS = [
  { key: 'Space', desc: 'Play / Pause playback' },
  { key: '→ / ←', desc: 'Seek forward / backward 5 seconds' },
  { key: 'L / J', desc: 'Skip to next / previous track' },
  { key: 'M', desc: 'Mute / Unmute audio volume' },
  { key: 'F', desc: 'Toggle Fullscreen Player mode' },
  { key: 'Q', desc: 'Open / Close Play Queue drawer' },
  { key: '?', desc: 'Show this keyboard shortcuts guide' },
  { key: 'Esc', desc: 'Close modals & fullscreen views' },
]

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-2xl bg-[#0e0f14] border border-white/[0.1] p-5 shadow-2xl z-10 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
              <Command className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Keyboard Shortcuts</h3>
              <p className="text-[0.7rem] text-slate-400">Quick keyboard controls</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-md transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="space-y-2">
          {SHORTCUTS.map((s) => (
            <div
              key={s.key}
              className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.04]"
            >
              <span className="text-xs text-slate-300 font-medium">{s.desc}</span>
              <kbd className="px-2.5 py-1 rounded-md bg-white/[0.08] border border-white/[0.12] text-[0.7rem] font-mono font-semibold text-white shadow-xs">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
