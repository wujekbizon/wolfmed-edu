"use client"

import { seededBars } from '@/helpers/mediaCellHelpers'

interface WaveformProps {
  seed: string
  playedPct: number
  isPlaying: boolean
}

export default function Waveform({ seed, playedPct, isPlaying }: WaveformProps) {
  const bars = seededBars(seed, 50)
  const playedBars = Math.round((playedPct / 100) * bars.length)

  return (
    <div className="flex items-center justify-between h-10 px-5 pt-3 shrink-0" aria-hidden="true">
      {bars.map((h, i) => (
        <div
          key={i}
          style={{ height: `${h}%` }}
          className={[
            'w-px rounded-full transition-opacity duration-150',
            i < playedBars
              ? ['bg-[#ff9898]', isPlaying ? 'opacity-100' : 'opacity-80'].join(' ')
              : 'bg-zinc-300',
          ].join(' ')}
        />
      ))}
    </div>
  )
}
