import { UploadCloud, AlertCircle } from 'lucide-react'
import { useRef, useState } from 'react'

type UploadZoneProps = {
  onUpload: (file: File, metadata?: { title?: string; artist?: string; album?: string; coverUrl?: string }) => Promise<void | string>
  isUploading: boolean
  progress: { [fileId: string]: number }
}

const SUPPORTED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4']
const SUPPORTED_EXTENSIONS = ['mp3', 'wav', 'ogg', 'm4a']

const isSupportedAudio = (file: File): boolean => {
  // Check by MIME type
  if (SUPPORTED_AUDIO_TYPES.includes(file.type)) {
    return true
  }

  // Check by file extension
  const extension = file.name.split('.').pop()?.toLowerCase() || ''
  return SUPPORTED_EXTENSIONS.includes(extension)
}

export function UploadZone({ onUpload, isUploading, progress }: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const currentProgress = Object.values(progress)[0] ?? 0

  const handleFile = async (file: File) => {
    if (!isSupportedAudio(file)) {
      setError(`Unsupported file type: ${file.name}. Please upload ${SUPPORTED_EXTENSIONS.join(', ')} files.`)
      setTimeout(() => setError(null), 5000)
      return
    }

    if (file.size > 100 * 1024 * 1024) {
      setError('File is too large. Maximum size is 100MB.')
      setTimeout(() => setError(null), 5000)
      return
    }

    setError(null)
    setSuccess(null)

    try {
      await onUpload(file)
      setSuccess(`Successfully uploaded "${file.name}"`)
      setTimeout(() => setSuccess(null), 4000)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed'
      setError(errorMsg)
      setTimeout(() => setError(null), 5000)
    }
  }

  return (
    <section className="glass-panel p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">Upload Dashboard</h2>
      <div
        className={`rounded-xl border-2 border-dashed p-8 text-center transition ${
          isDragOver ? 'border-indigo-400 bg-indigo-500/10' : 'border-white/15'
        } ${isUploading ? 'opacity-75' : ''}`}
        onDragOver={(event) => {
          event.preventDefault()
          event.stopPropagation()
          setIsDragOver(true)
        }}
        onDragLeave={(event) => {
          event.preventDefault()
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
        <UploadCloud className="mx-auto mb-2 size-8 text-slate-300" />
        <p className="text-sm text-slate-200">Drag and drop audio files here</p>
        <p className="mt-1 text-xs text-slate-400">Supported: {SUPPORTED_EXTENSIONS.join(', ')}</p>

        {isUploading && currentProgress > 0 && (
          <div className="mt-4 space-y-2">
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-indigo-500 transition-all duration-300"
                style={{ width: `${currentProgress}%` }}
              />
            </div>
            <p className="text-xs text-slate-400">{currentProgress}% uploading...</p>
          </div>
        )}

        <button
          type="button"
          className="mt-3 rounded-lg bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => !isUploading && inputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? `Uploading ${currentProgress}%` : 'Choose File'}
        </button>

        <input
          ref={inputRef}
          className="hidden"
          type="file"
          accept={`${SUPPORTED_AUDIO_TYPES.join(',')}`}
          disabled={isUploading}
          onChange={async (event) => {
            const file = event.target.files?.[0]
            if (file) await handleFile(file)
            // Reset input
            if (event.currentTarget) {
              event.currentTarget.value = ''
            }
          }}
        />

        {error && (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-rose-500/10 p-3 text-left">
            <AlertCircle className="mt-0.5 flex-shrink-0 size-4 text-rose-400" />
            <p className="text-xs text-rose-300">{error}</p>
          </div>
        )}

        {success && (
          <div className="mt-3 rounded-lg bg-emerald-500/10 p-3 text-xs text-emerald-300">{success}</div>
        )}
      </div>
    </section>
  )
}
