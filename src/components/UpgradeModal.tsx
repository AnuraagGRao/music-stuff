import { useState } from 'react'
import {
  Check,
  X,
  Crown,
  Sparkles,
  CloudUpload,
  ShieldCheck,
  Music2,
  HardDrive,
  CheckCircle2,
} from 'lucide-react'
import { useAudioStore } from '../store/audioStore'
import { PLAN_LIMITS } from '../utils/planLimits'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
}

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const { userPlan } = useAudioStore()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl my-8 rounded-3xl bg-[#0c0d12] border border-white/[0.12] p-6 sm:p-8 shadow-2xl z-10 space-y-6 text-white max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Close upgrade dialog"
        >
          <X className="size-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 max-w-lg mx-auto pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold tracking-wide uppercase font-mono">
            <Sparkles className="size-3.5 text-emerald-400 animate-pulse" />
            <span>Aura Cloud Subscription</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Expand Your Studio Storage
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Upload larger uncompressed tracks, preserve high-res audio, and sync your private discography across every device.
          </p>
        </div>

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 p-3 flex items-center gap-3 text-emerald-300 text-xs sm:text-sm animate-in fade-in">
            <CheckCircle2 className="size-5 flex-shrink-0 text-emerald-400" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {/* Billing Cycle Toggle */}
        <div className="flex items-center justify-center gap-3">
          <div className="inline-flex items-center rounded-xl bg-white/[0.06] p-1 border border-white/[0.08]">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-white text-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('yearly')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                billingCycle === 'yearly'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Annual</span>
              <span className="px-1.5 py-0.2 rounded-full bg-black/20 text-[0.65rem] font-bold uppercase tracking-wider">
                Save 35%
              </span>
            </button>
          </div>
        </div>

        {/* Tier Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Free Tier */}
          <div
            className={`rounded-2xl p-5 border flex flex-col justify-between transition-all ${
              userPlan === 'free'
                ? 'bg-white/[0.04] border-white/20 ring-1 ring-white/10'
                : 'bg-white/[0.02] border-white/[0.08] opacity-80 hover:opacity-100'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-white">{PLAN_LIMITS.free.tierName}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">For casual listening & testing</p>
                </div>
                {userPlan === 'free' && (
                  <span className="px-2.5 py-1 rounded-full text-[0.65rem] font-bold bg-white/10 text-slate-300 font-mono border border-white/15">
                    CURRENT PLAN
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white">$0</span>
                <span className="text-xs text-slate-400">/ forever</span>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-white/[0.06]">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <HardDrive className="size-3.5 text-slate-400 shrink-0" />
                  <span>Max file size: <strong className="text-white">15 MB</strong></span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CloudUpload className="size-3.5 text-slate-400 shrink-0" />
                  <span>Storage capacity: <strong className="text-white">5 tracks</strong></span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Music2 className="size-3.5 text-slate-400 shrink-0" />
                  <span>Standard quality (MP3, M4A, OGG)</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <ShieldCheck className="size-3.5 text-slate-400 shrink-0" />
                  <span>Basic queue & library sync</span>
                </div>
              </div>
            </div>

            <div
              className={`mt-6 w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-center ${
                userPlan === 'free'
                  ? 'bg-white/10 text-slate-300 border border-white/10'
                  : 'bg-white/[0.04] text-slate-500 border border-white/[0.06]'
              }`}
            >
              {userPlan === 'free' ? 'Current Free Plan' : 'Free Starter Tier'}
            </div>
          </div>

          {/* Pro Tier (Featured) */}
          <div
            className={`relative rounded-2xl p-5 border flex flex-col justify-between transition-all bg-gradient-to-b from-emerald-500/[0.08] via-emerald-950/20 to-black ${
              userPlan === 'pro'
                ? 'border-emerald-500/60 ring-2 ring-emerald-500/20 shadow-xl shadow-emerald-500/10'
                : 'border-emerald-500/30 hover:border-emerald-500/50 shadow-lg shadow-black/40'
            }`}
          >
            {/* Top Badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              {userPlan === 'pro' ? (
                <span className="flex items-center gap-1 px-3 py-0.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 text-black text-[0.65rem] font-extrabold uppercase tracking-wider shadow-md">
                  <Crown className="size-3" />
                  <span>VIP Pro Active</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-black text-[0.65rem] font-extrabold uppercase tracking-wider shadow-md">
                  <Sparkles className="size-3" />
                  <span>Coming Soon</span>
                </span>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between pt-1">
                <div>
                  <h3 className="font-bold text-base text-white flex items-center gap-1.5">
                    <span>{PLAN_LIMITS.pro.tierName}</span>
                    <span className="text-emerald-400 font-mono text-xs font-bold">⚡ PRO</span>
                  </h3>
                  <p className="text-xs text-emerald-300/80 mt-0.5">Audiophile quality & full cloud freedom</p>
                </div>
                {userPlan === 'pro' ? (
                  <span className="px-2.5 py-1 rounded-full text-[0.65rem] font-bold bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                    CURRENT PLAN
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-[0.65rem] font-bold bg-amber-500/10 text-amber-300 font-mono border border-amber-500/20">
                    COMING SOON
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-1">
                {billingCycle === 'yearly' ? (
                  <>
                    <span className="text-3xl font-extrabold text-white">$3.25</span>
                    <span className="text-xs text-slate-400">/ month ($39 billed annually)</span>
                  </>
                ) : (
                  <>
                    <span className="text-3xl font-extrabold text-white">$4.99</span>
                    <span className="text-xs text-slate-400">/ month</span>
                  </>
                )}
              </div>

              <div className="space-y-2.5 pt-2 border-t border-emerald-500/20">
                <div className="flex items-center gap-2 text-xs text-emerald-100">
                  <Check className="size-3.5 text-emerald-400 shrink-0 stroke-[2.5]" />
                  <span>Max file size: <strong className="text-white">100 MB</strong> (Lossless audio)</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-100">
                  <Check className="size-3.5 text-emerald-400 shrink-0 stroke-[2.5]" />
                  <span>Storage capacity: <strong className="text-white">Unlimited Tracks (∞)</strong></span>
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-100">
                  <Check className="size-3.5 text-emerald-400 shrink-0 stroke-[2.5]" />
                  <span>Lossless FLAC, WAV, High-Res ALAC support</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-100">
                  <Check className="size-3.5 text-emerald-400 shrink-0 stroke-[2.5]" />
                  <span>Priority CDN streaming & high-bitrate audio</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-100">
                  <Check className="size-3.5 text-emerald-400 shrink-0 stroke-[2.5]" />
                  <span>Exclusive ⚡ PRO subscriber badge</span>
                </div>
              </div>
            </div>

            {userPlan === 'pro' ? (
              <div className="mt-6 w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 shadow-lg shadow-emerald-500/10">
                <Crown className="size-3.5 text-emerald-400 fill-emerald-400" />
                <span>Active Aura Pro Member</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSuccessMessage('🚀 Aura Pro public subscriptions are coming soon! Stay tuned.')
                  setTimeout(() => setSuccessMessage(null), 4000)
                }}
                className="mt-6 w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer bg-white/10 hover:bg-white/15 text-slate-200 border border-white/15 active:scale-98 shadow-md"
              >
                <Sparkles className="size-3.5 text-amber-400" />
                <span>Aura Pro • Coming Soon</span>
              </button>
            )}
          </div>
        </div>

        {/* Plan Comparison Matrix */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
            Plan Specification Comparison
          </h4>
          <div className="divide-y divide-white/[0.06] text-xs">
            <div className="py-2 flex items-center justify-between">
              <span className="text-slate-400">Per-File Upload Limit</span>
              <div className="flex items-center gap-6">
                <span className="text-slate-300 w-16 text-right">15 MB</span>
                <span className="text-emerald-400 font-semibold w-16 text-right">100 MB</span>
              </div>
            </div>
            <div className="py-2 flex items-center justify-between">
              <span className="text-slate-400">Total Cloud Tracks</span>
              <div className="flex items-center gap-6">
                <span className="text-slate-300 w-16 text-right">5 tracks</span>
                <span className="text-emerald-400 font-semibold w-16 text-right">Unlimited ∞</span>
              </div>
            </div>
            <div className="py-2 flex items-center justify-between">
              <span className="text-slate-400">Audio Formats</span>
              <div className="flex items-center gap-6">
                <span className="text-slate-300 w-16 text-right">MP3, M4A</span>
                <span className="text-emerald-400 font-semibold w-16 text-right">+ FLAC, WAV</span>
              </div>
            </div>
            <div className="py-2 flex items-center justify-between">
              <span className="text-slate-400">Cloud Sync Speed</span>
              <div className="flex items-center gap-6">
                <span className="text-slate-300 w-16 text-right">Standard</span>
                <span className="text-emerald-400 font-semibold w-16 text-right">High Priority</span>
              </div>
            </div>
          </div>
        </div>

        {/* Legal & Terms Notice */}
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center space-y-1">
          <p className="text-[0.68rem] text-slate-400">
            <strong className="text-slate-300">Content & Copyright Disclaimer:</strong> Subscribers hold sole legal responsibility for all uploaded tracks. Music For All provides private cloud storage and strictly disclaims liability for unauthorized or unlicensed intellectual property. Infringing uploads are subject to immediate removal and account termination.
          </p>
          <p className="text-[0.65rem] text-slate-500 font-mono">
            DMCA Safe Harbor Compliant • 256-Bit Encrypted Cloud Sync • Cancel Anytime
          </p>
        </div>
      </div>
    </div>
  )
}
