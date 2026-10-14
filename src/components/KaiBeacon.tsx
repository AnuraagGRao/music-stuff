import { useState, useRef } from 'react';
import { ExternalLink, X, Disc3, Radio } from 'lucide-react';

interface KaiBeaconProps {
  isPlaying: boolean;
}

export function KaiBeacon({ isPlaying }: KaiBeaconProps) {
  const [isOpen, setIsOpen] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const djLines = [
    'Hyper-clean 48kHz Web Audio engine. No lossy transcoding.',
    'Pro tip: Tap Spacebar to play/pause, or use J / K to jump between tracks.',
    'Press Shift + L to open synchronized karaoke lyrics mode anytime.',
    'Overclocked low-latency playback powered by Firebase Cloud Storage.',
  ];
  const [lineIdx, setLineIdx] = useState(0);

  const playLaserChirp = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      // Upbeat kitsune arpeggio
      [587, 784, 987, 1174].forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.05);

        gain.gain.setValueAtTime(0.05, ctx.currentTime + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.05 + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.05);
        osc.stop(ctx.currentTime + i * 0.05 + 0.12);
      });
    } catch {
      // Audio safety
    }
  };

  const handleToggle = () => {
    playLaserChirp();
    if (!isOpen) {
      setLineIdx((prev) => (prev + 1) % djLines.length);
    }
    setIsOpen(!isOpen);
  };

  return (
    <aside aria-label="Kai DJ Companion" className="fixed bottom-24 right-5 z-40 flex flex-col items-end pointer-events-none select-none">
      {/* Dialogue Flyout */}
      {isOpen && (
        <div className="pointer-events-auto mb-3 w-80 p-4 rounded-2xl bg-slate-950/95 border border-amber-500/30 shadow-2xl backdrop-blur-xl space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between text-[11px] font-mono text-amber-400">
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
              <span>🦊</span> KAI // DJ KITSUNE
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-slate-200 font-sans leading-relaxed">
            {djLines[lineIdx]}
          </p>
          <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1 text-amber-400">
              <Radio className="w-3 h-3 animate-pulse" />
              <span>{isPlaying ? 'Live · 128 BPM' : 'Standby Mode'}</span>
            </span>
            <a
              href="https://craft.anuraaggrao.com/companions"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-amber-300 flex items-center gap-1"
            >
              <span>Companions Lab</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      )}

      {/* Main Beacon Capsule */}
      <button
        onClick={handleToggle}
        className="pointer-events-auto flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-slate-900/90 hover:bg-slate-850 border border-amber-500/30 text-white shadow-xl hover:scale-105 transition-all backdrop-blur-xl group cursor-pointer"
        title="Kai the Kitsune Fox - Click for DJ cues"
      >
        <div className="relative w-7 h-7 flex items-center justify-center">
          <Disc3 className={`w-7 h-7 text-amber-400 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
          <span className="absolute text-xs">🦊</span>
        </div>

        <div className="flex flex-col text-left">
          <span className="text-[11px] font-mono font-bold leading-tight group-hover:text-amber-300 transition-colors">
            Kai
          </span>
          <span className="text-[9px] font-mono text-amber-400 uppercase tracking-widest leading-none">
            {isPlaying ? 'FLOW' : 'IDLE'}
          </span>
        </div>
      </button>
    </aside>
  );
}
