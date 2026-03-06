"use client"

import { useRef, useState, useEffect, useId, useCallback } from 'react'
import { formatTime } from '@/helpers/formatDate'

interface BumpedSeekBarProps {
  playedPct: number
  currentTime: number
  duration: number
  onSeek: (pct: number) => void
}

const BUMP_W = 12   // tight half-width — line stays flat until very close to thumb
const LINE_Y = 16
const APEX_Y = 5
const SVG_H = 28

function buildBumpPath(thumbX: number, width: number): string {
  // Only arch if thumb has enough room on both sides
  const leftStart = thumbX - BUMP_W
  const rightEnd  = thumbX + BUMP_W
  return [
    `M 0 ${LINE_Y}`,
    `L ${leftStart} ${LINE_Y}`,
    `Q ${thumbX - BUMP_W / 2} ${LINE_Y} ${thumbX} ${APEX_Y}`,
    `Q ${thumbX + BUMP_W / 2} ${LINE_Y} ${rightEnd} ${LINE_Y}`,
    `L ${width} ${LINE_Y}`,
  ].join(' ')
}

function buildFlatPath(width: number): string {
  return `M 0 ${LINE_Y} L ${width} ${LINE_Y}`
}

export default function BumpedSeekBar({ playedPct, currentTime, duration, onSeek }: BumpedSeekBarProps) {
  const id = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      if (entry) setWidth(entry.contentRect.width)
    })
    ro.observe(el)
    setWidth(el.getBoundingClientRect().width)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (!isDragging) return
    const onUp = () => setIsDragging(false)
    window.addEventListener('mouseup', onUp)
    return () => window.removeEventListener('mouseup', onUp)
  }, [isDragging])

  const seekFromEvent = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect || width === 0) return
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    onSeek(pct)
  }, [width, onSeek])

  const thumbX = (playedPct / 100) * width
  // Only show bump if hovering/dragging AND thumb is away from edges
  const canBump = thumbX > BUMP_W && thumbX < width - BUMP_W
  const showBump = (isHovering || isDragging) && canBump

  const pathD = width > 0 ? (showBump ? buildBumpPath(thumbX, width) : buildFlatPath(width)) : ''
  const thumbCY = showBump ? APEX_Y : LINE_Y
  const thumbR  = showBump ? 6 : 4
  const remaining = duration - currentTime

  return (
    <div className="px-5 pb-1 shrink-0">
      <div
        ref={containerRef}
        className="cursor-pointer w-full select-none"
        style={{ height: SVG_H }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onMouseDown={e => { setIsDragging(true); seekFromEvent(e) }}
        onMouseMove={e => { if (isDragging) seekFromEvent(e) }}
        onClick={seekFromEvent}
      >
        {width > 0 && (
          <svg width={width} height={SVG_H} viewBox={`0 0 ${width} ${SVG_H}`} overflow="visible">
            <defs>
              <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ff9898" />
                <stop offset="100%" stopColor="#c026d3" />
              </linearGradient>
              <clipPath id={`clip-${id}`}>
                <rect x={0} y={0} width={thumbX} height={SVG_H + 20} />
              </clipPath>
            </defs>
            {/* Unplayed */}
            <path d={pathD} fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth={1.5} strokeLinecap="round" />
            {/* Played */}
            <path d={pathD} fill="none" stroke={`url(#grad-${id})`} strokeWidth={2} strokeLinecap="round" clipPath={`url(#clip-${id})`} />
            {/* Thumb */}
            <circle cx={thumbX} cy={thumbCY} r={thumbR} fill="white" stroke="#c026d3" strokeWidth={2} />
          </svg>
        )}
      </div>

      <div className="flex justify-between -mt-1">
        <span className="text-xs text-zinc-500">{formatTime(currentTime)}</span>
        <span className="text-xs text-zinc-500">
          {duration > 0 ? `–${formatTime(remaining)}` : '--:--'}
        </span>
      </div>
    </div>
  )
}
