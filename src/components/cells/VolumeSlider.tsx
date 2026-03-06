"use client"

import { useRef, useCallback, useEffect, useState } from 'react'
import { Volume2 } from 'lucide-react'

interface VolumeSliderProps {
  volume: number
  onChange: (v: number) => void
}

const TRACK_H = 72

export default function VolumeSlider({ volume, onChange }: VolumeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)

  const setFromEvent = useCallback((clientY: number) => {
    const rect = trackRef.current?.getBoundingClientRect()
    if (!rect) return
    const pct = 1 - (clientY - rect.top) / rect.height
    onChange(Math.max(0, Math.min(1, pct)))
  }, [onChange])

  useEffect(() => {
    if (!dragging) return
    const onMove = (e: MouseEvent) => setFromEvent(e.clientY)
    const onUp = () => setDragging(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [dragging, setFromEvent])

  const thumbTop = Math.round((1 - volume) * TRACK_H)

  return (
    <div className="flex flex-col items-center justify-end gap-2 w-9 py-3 px-1 border-l border-black/5 shrink-0">
      <div className="flex-1 flex items-center justify-center">
        <div
          ref={trackRef}
          className="relative cursor-pointer"
          style={{ width: 4, height: TRACK_H }}
          onMouseDown={e => { setDragging(true); setFromEvent(e.clientY) }}
          onClick={e => setFromEvent(e.clientY)}
        >
          {/* Track bg */}
          <div className="absolute inset-0 rounded-full bg-black/10" />
          {/* Filled portion */}
          <div
            className="absolute bottom-0 left-0 right-0 rounded-full bg-gradient-to-t from-[#ff9898] to-fuchsia-400"
            style={{ height: `${volume * 100}%` }}
          />
          {/* Thumb — white with fuchsia border */}
          <div
            className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-fuchsia-400 shadow-sm"
            style={{ top: thumbTop }}
          />
        </div>
      </div>
      <Volume2 className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
    </div>
  )
}
