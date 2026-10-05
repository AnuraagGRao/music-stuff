import { UploadCloud, AlertCircle, Zap, HardDrive, CheckCircle2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { useAudioStore } from '../store/audioStore'
import { PLAN_LIMITS } from '../utils/planLimits'

type UploadZoneProps = {
  onUpload: (file: File, metadata?: { title?: string; artist?: string; album?: string; coverUrl?: string }) => Promise<void | string>
  isUploading: boolean
  progress: { [fileId: string]: number }
  userTracksCount?: number
  onUpgradeClick?: () => void
}

const SUPPORTED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'audio/mp4',
  'audio/x-m4a',
  'audio/flac',
  'audio/x-flac',
]
const SUPPORTED_EXTENSIONS = ['mp3', 'wav', 'ogg', 'm4a', 'flac']

const isSupportedAudio = (file: File): boolean => {
  if (SUPPORTED_AUDIO_TYPES.includes(file.type)) {
    return true
  }
  const extension = file.name.split('.').pop()?.toLowerCase() || ''
  return SUPPORTED_EXTENSIONS.includes(extension)
}

export function UploadZone({
  onUpload,
  isUploading,
  progress,
  userTracksCount = 0,
  onUpgradeClick,
}: UploadZoneProps) {
  const { userPlan } = useAudioStore()
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<{ message: string; showUpgrade?: boolean } | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const currentPlanConfig = PLAN_LIMITS[userPlan] || PLAN_LIMITS.free
  const isFreePlan = userPlan === 'free'
  const isQuotaFull = isFreePlan && userTracksCount >= currentPlanConfig.maxTracks
  const currentProgress = Object.values(progress)[0] ?? 0

  const handleFile = async (file: File) => {
    // 1. Format validation
    if (!isSupportedAudio(file)) {
      setError({
        message: `Unsupported audio format: "${file.name}". Please upload ${SUPPORTED_EXTENSIONS.join(', ')} files.`,
      })
      setTimeout(() => setError(null), 6000)
      return
    }

    // 2. Storage track count quota check
    if (isFreePlan && userTracksCount >= currentPlanConfig.maxTracks) {
      setError({
        message: `Free storage limit reached (${userTracksCount}/${currentPlanConfig.maxTracks} tracks). Upgrade to Aura Pro for unlimited cloud storage.`,
        showUpgrade: true,
      })
      return
    }

    // 3. File size limit validation
    if (file.size > currentPlanConfig.maxFileSizeBytes) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1)
      if (isFreePlan) {
        setError({
          message: `File is ${fileSizeMB} MB. Free tier limit is ${currentPlanConfig.formattedFileSize} per file. Upgrade to Pro for up to 100 MB lossless uploads.`,
          showUpgrade: true,
        })
      } else {
        setError({
          message: `File is ${fileSizeMB} MB. Maximum upload limit is 100 MB.`,
          showUpgrade: false,
        })
      }
      return
    }

    setError(null)
    setSuccess(null)

    try {
      await onUpload(file)
      setSuccess(`Successfully uploaded "${file.name}" to your cloud library!`)
      setTimeout(() => setSuccess(null), 5000)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed'
      const isLimitError = errorMsg.toLowerCase().includes('limit') || errorMsg.toLowerCase().includes('quota')
      setError({
        message: errorMsg,
        showUpgrade: isLimitError && isFreePlan,
      })
    }
  }

  // Quota percentage for progress bar
  const quotaPercent = isFreePlan
    ? Math.min(100, Math.round((userTracksCount / currentPlanConfig.maxTracks) * 100))
    : 100

  return (
    <section className="glass-panel p-5 space-y-4">
      {/* Header & Storage Quota Pill */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-2">
          <HardDrive className="size-4 text-emerald-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
            Cloud Audio Storage
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {isFreePlan ? (
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[0.65rem] font-bold bg-white/10 text-slate-300 font-mono border border-white/10">
                Free: 15MB limit
              </span>
              {onUpgradeClick && (
                <button
                  type="button"
                  onClick={onUpgradeClick}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-black text-[0.65rem] font-bold shadow-md shadow-emerald-500/20 hover:opacity-90 transition cursor-pointer"
                >
                  <Zap className="size-3 fill-black" />
                  <span>Upgrade to Pro</span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[0.65rem] font-bold font-mono">
              <Zap className="size-3 text-emerald-400 fill-emerald-400" />
              <span>AURA PRO • 100MB UNLIMITED</span>
            </div>
          )}
        </div>
      </div>

      {/* Storage Capacity Gauge */}
      <div className="space-y-1.5 rounded-xl bg-white/[0.03] p-3 border border-white/[0.06]">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">
            {isFreePlan ? 'Cloud Storage Quota' : 'Aura Pro Cloud Storage'}
          </span>
          <span className="font-mono text-[0.7rem] text-slate-300">
            {isFreePlan ? (
              <>
                <strong className={userTracksCount >= 5 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                  {userTracksCount}
                </strong>
                {' / 5 tracks used'}
              </>
            ) : (
              <span className="text-emerald-400 font-semibold">{userTracksCount} tracks stored • Unlimited (∞)</span>
            )}
          </span>
        </div>

        {isFreePlan && (
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full transition-all duration-500 ${
                userTracksCount >= 5 ? 'bg-rose-500' : userTracksCount >= 4 ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${quotaPercent}%` }}
            />
          </div>
        )}
      </div>

      {/* Dropzone Container */}
      <div
        className={`rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
          isDragOver
            ? 'border-emerald-400 bg-emerald-500/10'
            : isQuotaFull
            ? 'border-rose-500/30 bg-rose-500/[0.03]'
            : 'border-white/15 hover:border-white/25 bg-white/[0.01]'
        } ${isUploading ? 'opacity-75' : ''}`}
        onDragOver={(event) => {
          event.preventDefault()
          event.stopPropagation()
          if (!isQuotaFull) setIsDragOver(true)
        }}
        onDragLeave={(event) => {
          event.preventDefault()
          event.stopPropagation()
          setIsDragOver(false)
        }}
        onDrop={async (event) => {
          event.preventDefault()
          event.stopPropagation()
          setIsDragOver(false)
          const file = event.dataTransfer.files[0]
          if (file) await handleFile(file)
        }}
      >
        <UploadCloud className={`mx-auto mb-2 size-8 ${isQuotaFull ? 'text-rose-400' : 'text-slate-300'}`} />

        {isQuotaFull ? (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-rose-300">Storage limit reached (5/5 tracks)</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You have reached your Free plan cap. Upgrade to Aura Pro to unlock unlimited track uploads and up to 100MB per track.
            </p>
            {onUpgradeClick && (
              <button
                type="button"
                onClick={onUpgradeClick}
                className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-4 py-2 text-xs font-bold text-black shadow-lg shadow-emerald-500/20 hover:opacity-90 active:scale-98 transition cursor-pointer"
              >
                <Zap className="size-3.5 fill-black" />
                <span>Upgrade for Unlimited Storage</span>
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-sm font-medium text-slate-200">Drag and drop audio files here</p>
            <p className="mt-1 text-xs text-slate-400">
              Supported: {SUPPORTED_EXTENSIONS.join(', ')} • Max {currentPlanConfig.formattedFileSize} per track
            </p>

            {isUploading && currentProgress > 0 && (
              <div className="mt-4 space-y-2 max-w-xs mx-auto">
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${currentProgress}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 font-mono">{currentProgress}% uploading to cloud...</p>
              </div>
            )}

            <button
              type="button"
              className="mt-4 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 px-4 py-2 text-xs font-semibold text-white transition active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              onClick={() => !isUploading && inputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? `Uploading (${currentProgress}%)` : 'Select Audio File'}
            </button>
          </>
        )}

        <input
          ref={inputRef}
          className="hidden"
          type="file"
          accept={`${SUPPORTED_AUDIO_TYPES.join(',')}`}
          disabled={isUploading || isQuotaFull}
          onChange={async (event) => {
            const file = event.target.files?.[0]
            if (file) await handleFile(file)
            if (event.currentTarget) {
              event.currentTarget.value = ''
            }
          }}
        />

        {/* Error notification banner with direct upgrade action */}
        {error && (
          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl bg-rose-500/15 border border-rose-500/30 p-3 text-left animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="mt-0.5 flex-shrink-0 size-4 text-rose-400" />
              <p className="text-xs text-rose-200">{error.message}</p>
            </div>
            {error.showUpgrade && onUpgradeClick && (
              <button
                type="button"
                onClick={onUpgradeClick}
                className="shrink-0 flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-black hover:bg-emerald-400 transition cursor-pointer"
              >
                <Zap className="size-3 fill-black" />
                <span>Upgrade to Pro</span>
              </button>
            )}
          </div>
        )}

        {/* Success notification banner */}
        {success && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 p-3 text-xs text-emerald-300 animate-in fade-in">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}
      </div>
    </section>
  )
}
