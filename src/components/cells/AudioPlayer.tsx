"use client"

import { useState } from 'react'
import { FileText, X } from 'lucide-react'
import MediaHeader from './MediaHeader'
import AudioScreen from './AudioScreen'
import Waveform from './Waveform'
import BumpedSeekBar from './BumpedSeekBar'
import PlayerControls from './PlayerControls'
import VolumeSlider from './VolumeSlider'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'
import type { MediaCellContent } from '@/types/cellTypes'

interface AudioPlayerProps {
  media: MediaCellContent
  cellId: string
  onDurationLoaded?: (duration: number) => void
}

export default function AudioPlayer({ media, cellId, onDurationLoaded }: AudioPlayerProps) {
  const [showTranscript, setShowTranscript] = useState(false)

  const {
    audioRef,
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
  } = useAudioPlayer({ onDurationLoaded })

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
          <div className="flex justify-end pb-2.5 pr-2.5">
            <button
              type="button"
              onClick={() => setShowTranscript(true)}
              className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              <FileText className="w-4 h-4" />
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

