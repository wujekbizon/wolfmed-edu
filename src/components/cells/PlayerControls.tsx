"use client"

import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react'
import { SPEED_OPTIONS, type SpeedOption } from '@/constants/mediaPlayer'

interface PlayerControlsProps {
  isPlaying: boolean
  ended: boolean
  speed: SpeedOption
  onTogglePlay: () => void
  onRestart: () => void
  onSkipBack: () => void
  onSkipForward: () => void
  onSpeedChange: (s: SpeedOption) => void
  disabled?: boolean
}

export default function PlayerControls({
  isPlaying,
  ended,
  speed,
  onTogglePlay,
  onRestart,
  onSkipBack,
  onSkipForward,
  onSpeedChange,
  disabled = false,
}: PlayerControlsProps) {
  const iconBtn = 'p-2 rounded-full text-zinc-500 hover:text-zinc-800 hover:bg-black/5 transition-colors'

  return (
    <div className={['px-3 sm:px-5 py-3 flex items-center gap-1 sm:gap-2 shrink-0', disabled ? 'opacity-40 pointer-events-none' : ''].join(' ')}>
      {/* Restart */}
      <button type="button" onClick={onRestart} title="Od początku" className={iconBtn}>
        <RotateCcw className="w-4 h-4" />
      </button>

      {/* Skip -15s */}
      <button type="button" onClick={onSkipBack} title="-15s" className={iconBtn}>
        <SkipBack className="w-4 h-4" />
      </button>

      {/* Play / Pause — circle */}
      <button
        type="button"
        onClick={onTogglePlay}
        className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff9898] to-fuchsia-400 flex items-center justify-center shadow-md hover:opacity-90 transition-opacity mx-1"
      >
        {isPlaying
          ? <Pause className="w-5 h-5 text-white" />
          : <Play className="w-5 h-5 text-white ml-0.5" />
        }
      </button>

      {/* Skip +15s */}
      <button type="button" onClick={onSkipForward} title="+15s" className={iconBtn}>
        <SkipForward className="w-4 h-4" />
      </button>

      {/* Speed pills */}
      <div className="flex items-center gap-1 ml-auto">
        {SPEED_OPTIONS.map(s => (
          <button
            key={s}
            type="button"
            onClick={() => onSpeedChange(s)}
            className={[
              (s === 0.75 || s === 2) ? 'hidden sm:inline-flex' : 'inline-flex',
              'px-2 py-0.5 rounded-full text-xs font-medium transition-colors items-center',
              speed === s
                ? 'bg-gradient-to-r from-[#ff9898] to-fuchsia-400 text-white'
                : 'bg-black/5 text-zinc-500 hover:bg-black/10',
            ].join(' ')}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  )
}
