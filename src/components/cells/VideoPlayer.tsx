"use client"

import MediaHeader from './MediaHeader'
import BumpedSeekBar from './BumpedSeekBar'
import PlayerControls from './PlayerControls'
import VolumeSlider from './VolumeSlider'
import { useVideoPlayer } from '@/hooks/useVideoPlayer'
import type { MediaCellContent } from '@/types/cellTypes'

interface VideoPlayerProps {
  media: MediaCellContent
  onDurationLoaded?: (duration: number) => void
}

export default function VideoPlayer({ media, onDurationLoaded }: VideoPlayerProps) {
  const {
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
  } = useVideoPlayer({ onDurationLoaded })

  return (
    <div className="flex flex-row h-full">
      <div className="flex flex-col flex-1 min-w-0 h-full">
        <MediaHeader title={media.title} sourceType="video" />
        <video
          ref={videoRef}
          src={media.url}
          preload="metadata"
          className="flex-1 min-h-0 w-full object-contain bg-black"
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
      </div>

      <VolumeSlider volume={volume} onChange={handleVolume} />
    </div>
  )
}
