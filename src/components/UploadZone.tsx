import { UploadCloud } from 'lucide-react'
import { useRef, useState } from 'react'

type UploadZoneProps = {
  onUpload: (file: File) => Promise<void>
  isUploading: boolean
  progress: number
}

const isSupportedAudio = (file: File) => file.type === 'audio/mpeg' || file.type === 'audio/wav'

export function UploadZone({ onUpload, isUploading, progress }: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!isSupportedAudio(file)) {
      setError('Please upload MP3 or WAV files only.')
      return
    }
    setError(null)
    await onUpload(file)
  }

  return (
    <section className="glass-panel p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">Upload Dashboard</h2>
      <div
        className={`rounded-xl border-2 border-dashed p-8 text-center transition ${
          isDragOver ? 'border-indigo-400 bg-indigo-500/10' : 'border-white/15'
        }`}
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={async (event) => {
          event.preventDefault()
          setIsDragOver(false)
          const file = event.dataTransfer.files[0]
          if (file) await handleFile(file)
        }}
      >
        <UploadCloud className="mx-auto mb-2 size-8 text-slate-300" />
        <p className="text-sm text-slate-200">Drag and drop MP3/WAV files here</p>
        <button
          type="button"
          className="mt-3 rounded-lg bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/20"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? `Uploading ${progress}%` : 'Choose File'}
        </button>
        <input
          ref={inputRef}
          className="hidden"
          type="file"
          accept="audio/mpeg,audio/wav"
          onChange={async (event) => {
            const file = event.target.files?.[0]
            if (file) await handleFile(file)
            event.currentTarget.value = ''
          }}
        />
        {error ? <p className="mt-2 text-xs text-rose-300">{error}</p> : null}
      </div>
    </section>
  )
}
