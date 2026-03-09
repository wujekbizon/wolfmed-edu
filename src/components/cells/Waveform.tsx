"use client"

import { useRef, useState, useEffect } from 'react'
import { seededBars } from '@/helpers/mediaCellHelpers'

interface WaveformProps {
  seed: string
  playedPct: number
  isPlaying: boolean
}

const BAR_W = 2
const BAR_GAP = 2
const SVG_H = 40

export default function Waveform({ seed, playedPct, isPlaying }: WaveformProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [svgWidth, setSvgWidth] = useState(0)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      if (entry) setSvgWidth(entry.contentRect.width)
    })
    ro.observe(el)
    setSvgWidth(el.getBoundingClientRect().width)
    return () => ro.disconnect()
  }, [])

  const barCount = svgWidth > 0 ? Math.floor(svgWidth / (BAR_W + BAR_GAP)) : 0
  const bars = seededBars(seed, barCount)
  const playedBars = Math.round((playedPct / 100) * barCount)

  return (
    <div ref={wrapRef} className="px-5 pt-3 shrink-0" style={{ height: SVG_H + 12 }} aria-hidden="true">
      {svgWidth > 0 && (
        <svg width={svgWidth} height={SVG_H}>
          {bars.map((heightPct, i) => {
            const x = i * (BAR_W + BAR_GAP)
            const bh = Math.max(2, (heightPct / 100) * SVG_H)
            const y = (SVG_H - bh) / 2
            const played = i < playedBars
            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={BAR_W}
                height={bh}
                rx={1}
                fill={played
                  ? isPlaying ? 'rgba(192,38,211,0.9)' : 'rgba(192,38,211,0.7)'
                  : 'rgba(0,0,0,0.18)'}
              />
            )
          })}
        </svg>
      )}
    </div>
  )
}
