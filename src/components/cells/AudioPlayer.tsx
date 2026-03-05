"use client"

import { useState, useRef, useCallback, useEffect } from 'react'
import MediaHeader from './MediaHeader'
import Waveform from './Waveform'
import BumpedSeekBar from './BumpedSeekBar'
import PlayerControls from './PlayerControls'
import TranscriptPanel from './TranscriptPanel'
import VolumeSlider from './VolumeSlider'
import type { MediaCellContent } from '@/types/cellTypes'
import type { SpeedOption } from '@/constants/mediaPlayer'

interface AudioPlayerProps {
  media: MediaCellContent
  cellId: string
  onDelete?: () => void
  isDeleting?: boolean
  onDurationLoaded?: (duration: number) => void
}

export default function AudioPlayer({
  media,
  cellId,
  onDelete,
  isDeleting,
  onDurationLoaded,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [speed, setSpeed] = useState<SpeedOption>(1)
  const [ended, setEnded] = useState(false)
  const [volume, setVolume] = useState(1)

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
    if (isPlaying) {
      audio.pause()
    } else {
      setEnded(false)
      audio.play()
    }
    setIsPlaying(p => !p)
  }, [isPlaying])

  const handleRestart = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = 0
    setEnded(false)
    audio.play()
    setIsPlaying(true)
  }, [])

  const handleSeek = useCallback((pct: number) => {
    const audio = audioRef.current
    if (!audio || duration === 0) return
    audio.currentTime = pct * duration
  }, [duration])

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
      <div className="flex flex-col flex-1 min-w-0">
        <MediaHeader
          title={media.title}
          sourceType="audio"
          duration={duration}
          onDelete={onDelete}
          isDeleting={isDeleting}
        />
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
          onSpeedChange={handleSpeed}
        />
        {media.transcript && <TranscriptPanel transcript={media.transcript} />}
      </div>
      <VolumeSlider volume={volume} onChange={handleVolume} />
      <audio ref={audioRef} src={media.url} preload="metadata" className="hidden" />
    </div>
  )
}
