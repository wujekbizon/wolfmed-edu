"use client"

import { useState, useRef, useCallback, useEffect } from 'react'
import { FileText, X } from 'lucide-react'
import MediaHeader from './MediaHeader'
import AudioScreen from './AudioScreen'
import Waveform from './Waveform'
import BumpedSeekBar from './BumpedSeekBar'
import PlayerControls from './PlayerControls'
import VolumeSlider from './VolumeSlider'
import type { MediaCellContent } from '@/types/cellTypes'
import type { SpeedOption } from '@/constants/mediaPlayer'

interface AudioPlayerProps {
  media: MediaCellContent
  cellId: string
  onDurationLoaded?: (duration: number) => void
}

export default function AudioPlayer({
  media,
  cellId,
  onDurationLoaded,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [speed, setSpeed] = useState<SpeedOption>(1)
  const [ended, setEnded] = useState(false)
  const [volume, setVolume] = useState(1)
  const [showTranscript, setShowTranscript] = useState(false)

  const playedPct = duration > 0 ? (currentTime / duration) * 100 : 0

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onTime = () => setCurrentTime(audio.currentTime)
    const onLoaded = () => {
      setDuration(audio.duration)
      onDurationLoaded?.(audio.duration)
    }
    const onEnded = () => { setIsPlaying(false); setEnded(true) }
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onLoaded)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onLoaded)
      audio.removeEventListener('ended', onEnded)
    }
  }, [onDurationLoaded])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      setEnded(false)
      const p = audio.play()
      if (p) p.catch(err => { if (err?.name !== 'AbortError') console.error(err) })
      setIsPlaying(true)
    } else {
      audio.pause()
      setIsPlaying(false)
    }
  }, [])

  const handleRestart = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = 0
    setEnded(false)
    const p = audio.play()
    if (p) p.catch(err => { if (err?.name !== 'AbortError') console.error(err) })
    setIsPlaying(true)
  }, [])

  const handleSkipBack = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = Math.max(0, audio.currentTime - 15)
  }, [])

  const handleSkipForward = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = Math.min(duration, audio.currentTime + 15)
  }, [duration])

  const handleSeek = useCallback((pct: number) => {
    const audio = audioRef.current
    if (!audio || audio.readyState < 1 || !audio.duration) return
    audio.currentTime = pct * audio.duration
  }, [])

  const handleSpeed = useCallback((s: SpeedOption) => {
    if (audioRef.current) audioRef.current.playbackRate = s
    setSpeed(s)
  }, [])

  const handleVolume = useCallback((v: number) => {
    if (audioRef.current) audioRef.current.volume = v
    setVolume(v)
  }, [])

  return (
    <div className="flex flex-row h-full">
      <div className="relative flex flex-col flex-1 min-w-0 h-full">
        <MediaHeader title={media.title} sourceType="audio" />
        <AudioScreen title={media.title} />
        <Waveform
          seed={media.lectureId ?? cellId}
          playedPct={playedPct}
          isPlaying={isPlaying}
        />
        <BumpedSeekBar
          playedPct={playedPct}
          currentTime={currentTime}
          duration={duration}
          onSeek={handleSeek}
        />
        <PlayerControls
          isPlaying={isPlaying}
          ended={ended}
          speed={speed}
          onTogglePlay={togglePlay}
          onRestart={handleRestart}
          onSkipBack={handleSkipBack}
          onSkipForward={handleSkipForward}
          onSpeedChange={handleSpeed}
        />

        {media.transcript && (
          <div className="flex justify-center pb-1.5">
            <button
              type="button"
              onClick={() => setShowTranscript(true)}
              className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              <FileText className="w-3 h-3" />
              Transkrypcja
            </button>
          </div>
        )}

        {showTranscript && media.transcript && (
          <div className="absolute inset-0 z-10 flex flex-col bg-white/95 backdrop-blur-sm rounded-2xl">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-100 shrink-0">
              <span className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
                <FileText className="w-3.5 h-3.5" />
                Transkrypcja
              </span>
              <button
                type="button"
                onClick={() => setShowTranscript(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3 scrollbar-thin scrollbar-webkit">
              <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-line">
                {media.transcript}
              </p>
            </div>
          </div>
        )}
      </div>

      <VolumeSlider volume={volume} onChange={handleVolume} />
      <audio ref={audioRef} src={media.url} preload="metadata" className="hidden" />
    </div>
  )
}

