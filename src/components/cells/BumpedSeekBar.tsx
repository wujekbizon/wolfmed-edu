"use client"

import { useRef, useState, useEffect, useId, useCallback } from 'react'
import { formatTime } from '@/helpers/formatDate'

interface BumpedSeekBarProps {
  playedPct: number
  currentTime: number
  duration: number
  onSeek: (pct: number) => void
}

const BUMP_W = 32
const LINE_Y = 16
const APEX_Y = 4
const SVG_H = 28
const THUMB_R_IDLE = 3
const THUMB_R_HOVER = 5

function buildBumpPath(thumbX: number, width: number): string {
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
    const ro = new ResizeObserver(entries => {
      const entry = entries[0]
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

  const showBump = isHovering || isDragging
  const thumbX = (playedPct / 100) * width
  const thumbY = showBump ? APEX_Y : LINE_Y
  const thumbR = showBump ? THUMB_R_HOVER : THUMB_R_IDLE
  const pathD = width > 0 ? (showBump ? buildBumpPath(thumbX, width) : buildFlatPath(width)) : ''
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
              <clipPath id={`played-${id}`}>
                <rect x={0} y={0} width={thumbX} height={SVG_H + 20} />
              </clipPath>
            </defs>
            <path d={pathD} fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth={1.5} strokeLinecap="round" />
            <path d={pathD} fill="none" stroke="#ff9898" strokeWidth={1.5} strokeLinecap="round" clipPath={`url(#played-${id})`} />
            <circle cx={thumbX} cy={thumbY} r={thumbR} fill="#ff9898" />
          </svg>
        )}
      </div>

      <div className="flex justify-between">
        <span className="text-xs text-zinc-400">{formatTime(currentTime)}</span>
        <span className="text-xs text-zinc-400">
          {duration > 0 ? `–${formatTime(remaining)}` : '--:--'}
        </span>
      </div>
    </div>
  )
}
