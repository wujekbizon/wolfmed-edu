"use client"

import { Volume2 } from 'lucide-react'

interface VolumeSliderProps {
  volume: number
  onChange: (v: number) => void
}

export default function VolumeSlider({ volume, onChange }: VolumeSliderProps) {
  return (
    <div className="flex flex-col items-center justify-end gap-2 w-10 py-4 px-1 border-l border-white/10 shrink-0">
      {/* Rotated range input acting as vertical slider */}
      <div className="flex-1 flex items-center justify-center">
        <input
          type="range"
          min={0}
          max={1}
          step={0.02}
          value={volume}
          onChange={e => onChange(parseFloat(e.target.value))}
          className="volume-slider"
          style={{
            writingMode: 'vertical-lr' as React.CSSProperties['writingMode'],
            direction: 'rtl',
            WebkitAppearance: 'slider-vertical',
            appearance: 'none',
            width: 4,
            height: 80,
            cursor: 'pointer',
            background: `linear-gradient(to top, white ${volume * 100}%, rgba(255,255,255,0.2) ${volume * 100}%)`,
            borderRadius: 9999,
            outline: 'none',
            border: 'none',
          }}
        />
      </div>
      <Volume2 className="w-4 h-4 text-white/40 shrink-0" />
    </div>
  )
}
