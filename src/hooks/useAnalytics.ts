import { useRef } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

const PLAY_THRESHOLD_SECONDS = 10
const SKIP_THRESHOLD_SECONDS = 15

type AnalyticsEvent = 'play' | 'skip' | 'complete' | 'heart'

export function useAnalytics() {
  const trackingRef = useRef<{
    trackId: string | null
    startTime: number | null
    duration: number
    hasLogged: boolean
  }>({
    trackId: null,
    startTime: null,
    duration: 0,
    hasLogged: false,
  })

  const logEvent = async (trackId: string, action: AnalyticsEvent, listenDuration: number, duration: number) => {
    const user = auth.currentUser
    if (!user) return

    try {
      const percentagePlayed = (listenDuration / duration) * 100

      await addDoc(collection(db, 'user_history'), {
        userId: user.uid,
        trackId,
        action,
        listenDuration: Math.round(listenDuration),
        percentagePlayed: Math.round(percentagePlayed * 100) / 100,
        timestamp: serverTimestamp(),
      })
    } catch (err) {
      console.error('Failed to log analytics event:', err)
    }
  }

  const trackPlayStart = (trackId: string, duration: number) => {
    trackingRef.current = {
      trackId,
      startTime: Date.now(),
      duration,
      hasLogged: false,
    }
  }

  const trackPlayComplete = () => {
    const { trackId, startTime, duration, hasLogged } = trackingRef.current

    if (!trackId || !startTime || hasLogged) return

    const listenDuration = (Date.now() - startTime) / 1000

    // Log 'complete' if track finished naturally
    if (listenDuration >= duration * 0.9) {
      void logEvent(trackId, 'complete', listenDuration, duration)
      trackingRef.current.hasLogged = true
      return
    }

    // Log 'play' if listened for more than threshold
    if (listenDuration >= PLAY_THRESHOLD_SECONDS) {
      void logEvent(trackId, 'play', listenDuration, duration)
      trackingRef.current.hasLogged = true
    }
  }

  const trackPlaySkip = () => {
    const { trackId, startTime, duration, hasLogged } = trackingRef.current

    if (!trackId || !startTime || hasLogged) return

    const listenDuration = (Date.now() - startTime) / 1000

    // Log 'skip' if skipped within threshold
    if (listenDuration < SKIP_THRESHOLD_SECONDS) {
      void logEvent(trackId, 'skip', listenDuration, duration)
      trackingRef.current.hasLogged = true
    } else if (listenDuration >= PLAY_THRESHOLD_SECONDS) {
      // Log as 'play' if skip happens after minimum listen
      void logEvent(trackId, 'play', listenDuration, duration)
      trackingRef.current.hasLogged = true
    }
  }

  const logHeartEvent = async (trackId: string) => {
    const user = auth.currentUser
    if (!user) return

    try {
      await addDoc(collection(db, 'user_history'), {
        userId: user.uid,
        trackId,
        action: 'heart',
        listenDuration: 0,
        percentagePlayed: 0,
        timestamp: serverTimestamp(),
      })
    } catch (err) {
      console.error('Failed to log heart event:', err)
    }
  }

  return {
    trackPlayStart,
    trackPlayComplete,
    trackPlaySkip,
    logHeartEvent,
  }
}
