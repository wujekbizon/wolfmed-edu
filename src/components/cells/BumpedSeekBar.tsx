"use client"

import { useRef, useState, useEffect, useId } from 'react'
import { formatTime } from '@/helpers/formatDate'

interface BumpedSeekBarProps {
  playedPct: number
  currentTime: number
  duration: number
  onSeek: (pct: number) => void
}

const BUMP_W = 36   // bezier half-width in px
const LINE_Y = 26   // baseline y (flat line)
const APEX_Y = 10   // thumb apex y (bump peak)
const SVG_H = 40

function buildPath(thumbX: number, width: number): string {
  const leftStart = Math.max(0, thumbX - BUMP_W)
  const rightEnd = Math.min(width, thumbX + BUMP_W)
  return [
    `M 0 ${LINE_Y}`,
    `L ${leftStart} ${LINE_Y}`,
    `Q ${thumbX - BUMP_W / 2} ${LINE_Y} ${thumbX} ${APEX_Y}`,
    `Q ${thumbX + BUMP_W / 2} ${LINE_Y} ${rightEnd} ${LINE_Y}`,
    `L ${width} ${LINE_Y}`,
  ].join(' ')
}

export default function BumpedSeekBar({ playedPct, currentTime, duration, onSeek }: BumpedSeekBarProps) {
  const id = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => {
      const entry = entries[0]
      if (entry) setWidth(entry.contentRect.width)
    })
    ro.observe(el)
    setWidth(el.getBoundingClientRect().width)
    return () => ro.disconnect()
  }, [])

  const thumbX = (playedPct / 100) * width
  const pathD = width > 0 ? buildPath(thumbX, width) : ''
  const remaining = duration - currentTime

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect || width === 0) return
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    onSeek(pct)
  }

  return (
    <div className="px-5 pb-1 shrink-0">
      <div
        ref={containerRef}
        onClick={handleClick}
        className="cursor-pointer w-full"
        style={{ height: SVG_H }}
      >
        {width > 0 && (
          <svg width={width} height={SVG_H} viewBox={`0 0 ${width} ${SVG_H}`} overflow="visible">
            <defs>
              <clipPath id={`played-${id}`}>
                <rect x={0} y={0} width={thumbX} height={SVG_H} />
              </clipPath>
            </defs>
            {/* Unplayed path */}
            <path d={pathD} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={2} strokeLinecap="round" />
            {/* Played path */}
            <path d={pathD} fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" clipPath={`url(#played-${id})`} />
            {/* Thumb */}
            <circle cx={thumbX} cy={APEX_Y} r={5} fill="white" />
          </svg>
        )}
      </div>

      <div className="flex justify-between mt-0.5">
        <span className="text-xs text-white/50">{formatTime(currentTime)}</span>
        <span className="text-xs text-white/50">
          {duration > 0 ? `–${formatTime(remaining)}` : '--:--'}
        </span>
      </div>
    </div>
  )
}
