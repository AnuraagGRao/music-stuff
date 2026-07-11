import { useEffect, useMemo, useRef, useState } from 'react'
import { FastAverageColor } from 'fast-average-color'
import { useAudioStore } from '../store/audioStore'

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(new Audio())
  const facRef = useRef(new FastAverageColor())
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [accentColor, setAccentColor] = useState('rgba(124, 58, 237, 0.9)')

  const {
    tracks,
    currentTrackId,
    playNext,
    volume,
    setVolume,
    addRecentlyPlayed,
    setCurrentTrack,
  } = useAudioStore()

  const currentTrack = useMemo(
    () => tracks.find((track) => track.id === currentTrackId) ?? tracks[0],
    [tracks, currentTrackId],
  )

  useEffect(() => {
    const audio = audioRef.current
    audio.volume = volume
  }, [volume])

  useEffect(() => {
    const audio = audioRef.current
    if (!currentTrack) return
    audio.src = currentTrack.audioUrl
    audio.load()
    if (isPlaying) {
      void audio.play()
    }

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = currentTrack.coverUrl
    img.onload = () => {
      void facRef.current.getColorAsync(img).then((color) => setAccentColor(color.rgba))
    }

    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        album: currentTrack.album,
        artwork: [{ src: currentTrack.coverUrl, sizes: '512x512', type: 'image/jpeg' }],
      })
      navigator.mediaSession.setActionHandler('play', () => setIsPlaying(true))
      navigator.mediaSession.setActionHandler('pause', () => setIsPlaying(false))
      navigator.mediaSession.setActionHandler('nexttrack', playNext)
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        const index = tracks.findIndex((track) => track.id === currentTrack.id)
        if (index > 0) setCurrentTrack(tracks[index - 1].id)
      })
    }

    addRecentlyPlayed(currentTrack.id)
  }, [currentTrack, isPlaying, playNext, tracks, addRecentlyPlayed, setCurrentTrack])

  useEffect(() => {
    const fac = facRef.current
    const audio = audioRef.current
    const onTimeUpdate = () => setCurrentTime(audio.currentTime)
    const onEnded = () => {
      setCurrentTime(0)
      playNext()
    }
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('ended', onEnded)
      fac.destroy()
    }
  }, [playNext])

  useEffect(() => {
    const audio = audioRef.current
    if (!currentTrack) return
    if (isPlaying) {
      void audio.play()
    } else {
      audio.pause()
    }
  }, [isPlaying, currentTrack])

  const duration = currentTrack?.duration ?? 0

  return {
    isPlaying,
    setIsPlaying,
    currentTime,
    duration,
    currentTrack,
    accentColor,
    volume,
    setVolume,
    seek: (time: number) => {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    },
    playTrack: (id: string) => {
      setCurrentTrack(id)
      setIsPlaying(true)
    },
  }
}
