import { useEffect, useMemo, useRef, useState } from 'react'
import { FastAverageColor } from 'fast-average-color'
import { useAudioStore } from '../store/audioStore'

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(new Audio())
  const facRef = useRef(new FastAverageColor())
  const [accentColor, setAccentColor] = useState('rgba(124, 58, 237, 0.9)')
  const [error, setError] = useState<string | null>(null)

  const {
    tracks,
    currentTrackId,
    playNext,
    playPrevious,
    volume,
    setVolume,
    addRecentlyPlayed,
    setCurrentTrack,
    shuffled,
    repeatMode,
    toggleShuffle,
    cycleRepeat,
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
  } = useAudioStore()

  const currentTrack = useMemo(
    () => tracks.find((track) => track.id === currentTrackId) ?? tracks[0],
    [tracks, currentTrackId],
  )

  // Sync volume to audio element
  useEffect(() => {
    const audio = audioRef.current
    audio.volume = Math.max(0, Math.min(1, volume))
  }, [volume])

  // Load track when it changes (separate from playback)
  useEffect(() => {
    const audio = audioRef.current
    if (!currentTrack) {
      setError('No track available')
      return
    }

    try {
      // Pause first to prevent double playback
      audio.pause()
      audio.currentTime = 0
      
      audio.src = currentTrack.audioUrl
      audio.load()
      setError(null)
    } catch (err) {
      console.error('Track load error:', err)
      setError('Failed to load track')
    }

    // Extract and set dominant color from cover art
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = currentTrack.coverUrl
    img.onload = () => {
      facRef.current.getColorAsync(img).then((color) => {
        setAccentColor(color.rgba)
      })
    }
    img.onerror = () => {
      console.warn('Failed to load cover art for color extraction')
    }

    // Update MediaSession with track info
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        album: currentTrack.album,
        artwork: [{ src: currentTrack.coverUrl, sizes: '512x512', type: 'image/jpeg' }],
      })

      navigator.mediaSession.setActionHandler('play', () => setIsPlaying(true))
      navigator.mediaSession.setActionHandler('pause', () => setIsPlaying(false))
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        playNext()
      })
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        playPrevious()
      })
    }

    addRecentlyPlayed(currentTrack.id)
  // Only depend on currentTrack.id to avoid multiple reloads
  }, [currentTrack?.id, playNext, playPrevious, addRecentlyPlayed])

  // Handle play/pause (separate effect)
  useEffect(() => {
    const audio = audioRef.current
    if (!currentTrack) return

    if (isPlaying) {
      audio.play().catch((err) => {
        console.error('Play error:', err)
        setError('Failed to play audio')
      })
    } else {
      audio.pause()
    }
  }, [isPlaying, currentTrack?.id])

  // Sync audio element state with UI state (prevents double-play when switching views)
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    // If audio is actually playing but UI says paused, or vice versa, fix it
    const isAudioPlaying = !audio.paused && audio.currentTime > 0
    if (isAudioPlaying && !isPlaying) {
      setIsPlaying(true)
    } else if (!isAudioPlaying && isPlaying) {
      // Don't auto-pause; let explicit pause control handle it
    }
  }, []) // Run once on mount to sync

  // Time update and track ending
  useEffect(() => {
    const audio = audioRef.current
    let rafId: number | null = null
    let lastReportedTime = 0

    const updateTime = () => {
      const currentTime = audio.currentTime
      // Only update if time has actually changed to avoid unnecessary re-renders
      if (Math.abs(currentTime - lastReportedTime) > 0.01) {
        lastReportedTime = currentTime
        setCurrentTime(currentTime)
      }
      rafId = requestAnimationFrame(updateTime)
    }

    const onEnded = () => {
      lastReportedTime = 0
      setCurrentTime(0)
      if (rafId !== null) cancelAnimationFrame(rafId)
      playNext()
    }

    const onError = () => {
      setError('Audio playback error')
      if (rafId !== null) cancelAnimationFrame(rafId)
    }

    const onPlay = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(updateTime)
      }
    }

    const onPause = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
        rafId = null
      }
    }

    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onError)
    }
  }, [playNext])

  const duration = currentTrack?.duration ?? 0

  return {
    // Playback state
    isPlaying,
    setIsPlaying,
    currentTime,
    duration,
    error,

    // Track info
    currentTrack,
    accentColor,

    // Volume control
    volume,
    setVolume: (newVolume: number) => setVolume(Math.max(0, Math.min(1, newVolume))),

    // Playback controls
    seek: (time: number) => {
      if (currentTrack) {
        const clampedTime = Math.max(0, Math.min(time, duration))
        audioRef.current.currentTime = clampedTime
        setCurrentTime(clampedTime)
      }
    },
    playTrack: (id: string) => {
      setCurrentTrack(id)
      setIsPlaying(true)
    },
    playNext: () => {
      playNext()
    },
    playPrevious: () => {
      playPrevious()
    },

    // Queue controls
    shuffled,
    repeatMode,
    toggleShuffle,
    cycleRepeat,
  }
}
