"use client"

import { Volume2 } from 'lucide-react'

interface VolumeSliderProps {
  volume: number
  onChange: (v: number) => void
}

export default function VolumeSlider({ volume, onChange }: VolumeSliderProps) {
  return (
    <div className="flex flex-col items-center justify-end gap-2 w-9 py-3 px-1 border-l border-black/5 shrink-0">
      <div className="flex-1 flex items-center justify-center">
        <input
          type="range"
          min={0}
          max={1}
          step={0.02}
          value={volume}
          onChange={e => onChange(parseFloat(e.target.value))}
          style={{
            writingMode: 'vertical-lr' as React.CSSProperties['writingMode'],
            direction: 'rtl',
            WebkitAppearance: 'slider-vertical',
            appearance: 'none',
            width: 3,
            height: 72,
            cursor: 'pointer',
            background: `linear-gradient(to top, #ff9898 ${volume * 100}%, rgba(0,0,0,0.1) ${volume * 100}%)`,
            borderRadius: 9999,
            outline: 'none',
            border: 'none',
          }}
        />
      </div>
      <Volume2 className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
    </div>
  )
}
