"use client"

import { Play, Pause, RotateCcw } from 'lucide-react'
import { SPEED_OPTIONS, type SpeedOption } from '@/constants/mediaPlayer'

interface PlayerControlsProps {
  isPlaying: boolean
  ended: boolean
  speed: SpeedOption
  onTogglePlay: () => void
  onRestart: () => void
  onSpeedChange: (s: SpeedOption) => void
  disabled?: boolean
}

export default function PlayerControls({
  isPlaying,
  ended,
  speed,
  onTogglePlay,
  onRestart,
  onSpeedChange,
  disabled = false,
}: PlayerControlsProps) {
  return (
    <div className={['px-5 py-4 flex items-center gap-3 shrink-0', disabled ? 'opacity-40 pointer-events-none' : ''].join(' ')}>
      <button
        type="button"
        onClick={onRestart}
        title="Od początku"
        className="p-2 rounded-full text-white/40 hover:text-white/80 hover:bg-white/10 transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={onTogglePlay}
        className={[
          'flex-1 flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium rounded-full transition-opacity',
          disabled
            ? 'bg-white/10 text-white/40'
            : 'bg-gradient-to-r from-[#ff9898] to-fuchsia-400 text-white hover:opacity-90',
        ].join(' ')}
      >
        {isPlaying
          ? <><Pause className="w-4 h-4" /> Pauza</>
          : <><Play className="w-4 h-4" /> {ended ? 'Od początku' : 'Odtwórz'}</>
        }
      </button>

      <div className="flex items-center gap-1">
        {SPEED_OPTIONS.map(s => (
          <button
            key={s}
            type="button"
            onClick={() => onSpeedChange(s)}
            className={[
              'px-2 py-0.5 rounded-full text-xs font-medium transition-colors',
              speed === s
                ? 'bg-gradient-to-r from-[#ff9898] to-fuchsia-400 text-white'
                : 'bg-white/10 text-white/50 hover:bg-white/20',
            ].join(' ')}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  )
}
