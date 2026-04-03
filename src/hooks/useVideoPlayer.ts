import { useState, useRef, useCallback, useEffect } from 'react'
import type { SpeedOption } from '@/constants/mediaPlayer'

interface UseVideoPlayerOptions {
  onDurationLoaded?: ((duration: number) => void) | undefined
}

/**
 * Hook that manages all state and controls for an HTML `<video>` element.
 *
 * Attaches native event listeners (`timeupdate`, `loadedmetadata`, `ended`) to the
 * video element via `videoRef` and exposes derived state alongside memoized control
 * callbacks. All playback mutations go through the ref so callbacks never become stale.
 *
 * AbortError rejections from `video.play()` are silently swallowed — they are expected
 * when play is interrupted by an immediate pause or src change.
 *
 * @param options.onDurationLoaded - Optional callback fired once the video metadata loads,
 *   receiving the total duration in seconds.
 *
 * @returns An object with:
 * - `videoRef` – ref to attach to the `<video>` element
 * - `isPlaying` – whether the video is currently playing
 * - `currentTime` – playback position in seconds
 * - `duration` – total duration in seconds
 * - `speed` – current playback rate (`SpeedOption`)
 * - `ended` – whether playback has reached the end
 * - `volume` – current volume level (`0`–`1`)
 * - `playedPct` – playback progress as a percentage (`0`–`100`)
 * - `togglePlay` – toggles between play and pause
 * - `handleRestart` – seeks to 0 and starts playing
 * - `handleSkipBack` – seeks back 15 seconds
 * - `handleSkipForward` – seeks forward 15 seconds
 * - `handleSeek` – seeks to a position given as a fraction (`0`–`1`)
 * - `handleSpeed` – sets playback rate
 * - `handleVolume` – sets volume level
 */
export function useVideoPlayer({ onDurationLoaded }: UseVideoPlayerOptions) {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [speed, setSpeed] = useState<SpeedOption>(1)
  const [ended, setEnded] = useState(false)
  const [volume, setVolume] = useState(1)

  const playedPct = duration > 0 ? (currentTime / duration) * 100 : 0

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const onTime = () => setCurrentTime(video.currentTime)
    const onLoaded = () => {
      setDuration(video.duration)
      onDurationLoaded?.(video.duration)
    }
    const onEnded = () => { setIsPlaying(false); setEnded(true) }
    video.addEventListener('timeupdate', onTime)
    video.addEventListener('loadedmetadata', onLoaded)
    video.addEventListener('ended', onEnded)
    return () => {
      video.removeEventListener('timeupdate', onTime)
      video.removeEventListener('loadedmetadata', onLoaded)
      video.removeEventListener('ended', onEnded)
    }
  }, [onDurationLoaded])

  const togglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      setEnded(false)
      const p = video.play()
      if (p) p.catch(err => { if (err?.name !== 'AbortError') console.error(err) })
      setIsPlaying(true)
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }, [])

  const handleRestart = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = 0
    setEnded(false)
    const p = video.play()
    if (p) p.catch(err => { if (err?.name !== 'AbortError') console.error(err) })
    setIsPlaying(true)
  }, [])

  const handleSkipBack = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = Math.max(0, video.currentTime - 15)
  }, [])

  const handleSkipForward = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = Math.min(duration, video.currentTime + 15)
  }, [duration])

  const handleSeek = useCallback((pct: number) => {
    const video = videoRef.current
    if (!video || video.readyState < 1 || !video.duration) return
    video.currentTime = pct * video.duration
  }, [])

  const handleSpeed = useCallback((s: SpeedOption) => {
    if (videoRef.current) videoRef.current.playbackRate = s
    setSpeed(s)
  }, [])

  const handleVolume = useCallback((v: number) => {
    if (videoRef.current) videoRef.current.volume = v
    setVolume(v)
  }, [])

  return {
    videoRef,
    isPlaying,
    currentTime,
    duration,
    speed,
    ended,
    volume,
    playedPct,
    togglePlay,
    handleRestart,
    handleSkipBack,
    handleSkipForward,
    handleSeek,
    handleSpeed,
    handleVolume,
  }
}
