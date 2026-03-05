"use client"

import { useRef } from 'react'
import { seededBars } from '@/helpers/mediaCellHelpers'
import { formatTime } from '@/helpers/formatDate'

interface WaveformProps {
  seed: string
  playedPct: number
  currentTime: number
  duration: number
  onSeek: (e: React.MouseEvent<HTMLDivElement>) => void
  seekTrackRef: React.RefObject<HTMLDivElement | null>
}

export default function Waveform({ seed, playedPct, currentTime, duration, onSeek, seekTrackRef }: WaveformProps) {
  const bars = seededBars(seed)
  const playedBars = Math.round((playedPct / 100) * bars.length)

  return (
    <div className="px-5 pt-5 pb-2 shrink-0">
      {/* Decorative bars */}
      <div className="flex items-end gap-[3px] h-12 mb-3" aria-hidden="true">
        {bars.map((h, i) => (
          <div
            key={i}
            style={{ height: `${h}%` }}
            className={[
              'flex-1 rounded-full transition-opacity duration-150',
              i < playedBars
                ? 'bg-gradient-to-t from-[#ff9898] to-fuchsia-400'
                : 'bg-zinc-200',
            ].join(' ')}
          />
        ))}
      </div>

      {/* Seek track */}
      <div
        ref={seekTrackRef}
        onClick={onSeek}
        className="relative h-1.5 rounded-full bg-zinc-200 cursor-pointer group"
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#ff9898] to-fuchsia-400 transition-all"
          style={{ width: `${playedPct}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white ring-2 ring-[#ff9898] shadow opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `${playedPct}%` }}
        />
      </div>

      {/* Timestamps */}
      <div className="flex justify-between mt-1.5">
        <span className="text-xs text-zinc-400">{formatTime(currentTime)}</span>
        <span className="text-xs text-zinc-400">{duration > 0 ? formatTime(duration) : '--:--'}</span>
      </div>
    </div>
  )
}
