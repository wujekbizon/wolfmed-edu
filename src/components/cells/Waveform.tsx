"use client"

import { seededBars } from '@/helpers/mediaCellHelpers'

interface WaveformProps {
  seed: string
  playedPct: number
  isPlaying: boolean
}

export default function Waveform({ seed, playedPct, isPlaying }: WaveformProps) {
  const bars = seededBars(seed)
  const playedBars = Math.round((playedPct / 100) * bars.length)

  return (
    <div className="flex items-center gap-[3px] h-14 px-5 pt-4 shrink-0" aria-hidden="true">
      {bars.map((h, i) => (
        <div
          key={i}
          style={{ height: `${h}%` }}
          className={[
            'flex-1 rounded-sm transition-opacity duration-150',
            i < playedBars
              ? ['bg-white', isPlaying ? 'opacity-90' : 'opacity-75'].join(' ')
              : 'bg-white/20',
          ].join(' ')}
        />
      ))}
    </div>
  )
}
