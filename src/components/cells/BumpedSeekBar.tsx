"use client"

import { useRef, useState, useEffect, useId, useCallback } from 'react'
import { formatTime } from '@/helpers/formatDate'

interface BumpedSeekBarProps {
  playedPct: number
  currentTime: number
  duration: number
  onSeek: (pct: number) => void
}

const BUMP_W = 22
const LINE_Y = 16
const APEX_Y = 5
const SVG_H = 28

function buildBumpPath(thumbX: number, width: number): string {
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
  const isDraggingRef = useRef(false)
  // Local drag position — snappy visual independent of timeupdate lag
  const [dragPct, setDragPct] = useState<number | null>(null)

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

  const getPctFromClientX = useCallback((clientX: number): number => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect || width === 0) return 0
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
  }, [width])

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return
      setDragPct(getPctFromClientX(e.clientX))
    }
    const onMouseUp = (e: MouseEvent) => {
      if (!isDraggingRef.current) return
      isDraggingRef.current = false
      setIsDragging(false)
      const pct = getPctFromClientX(e.clientX)
      setDragPct(null)
      onSeek(pct)
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [getPctFromClientX, onSeek])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    isDraggingRef.current = true
    setIsDragging(true)
    const pct = getPctFromClientX(e.clientX)
    setDragPct(pct)
    onSeek(pct)
  }, [getPctFromClientX, onSeek])

  // Use local dragPct when dragging for snappy visual, fall back to playedPct
  const activePct = dragPct !== null ? dragPct * 100 : playedPct
  const thumbX = (activePct / 100) * width
  const canBump = thumbX > BUMP_W && thumbX < width - BUMP_W
  const showBump = (isHovering || isDragging) && canBump

  const pathD = width > 0 ? (showBump ? buildBumpPath(thumbX, width) : buildFlatPath(width)) : ''
  const thumbCY = showBump ? APEX_Y : LINE_Y
  const thumbR  = showBump ? 6 : 4

  const displayTime = dragPct !== null ? dragPct * duration : currentTime
  const displayRemaining = duration - displayTime

  return (
    <div className="px-5 pb-1 shrink-0">
      <div
        ref={containerRef}
        className="cursor-pointer w-full select-none"
        style={{ height: SVG_H }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onMouseDown={handleMouseDown}
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
            <path d={pathD} fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth={2} strokeLinecap="round" />
            <path d={pathD} fill="none" stroke={`url(#grad-${id})`} strokeWidth={2.5} strokeLinecap="round" clipPath={`url(#clip-${id})`} />
            <circle cx={thumbX} cy={thumbCY} r={thumbR} fill="white" stroke="#c026d3" strokeWidth={2} />
          </svg>
        )}
      </div>

      <div className="flex justify-between -mt-1">
        <span className="text-xs text-zinc-500">{formatTime(displayTime)}</span>
        <span className="text-xs text-zinc-500">
          {duration > 0 ? `–${formatTime(displayRemaining)}` : '--:--'}
        </span>
      </div>
    </div>
  )
}
