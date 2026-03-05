"use client"

import { useState, useRef, useCallback, useEffect } from 'react'
import { Headphones, Play, Pause, RotateCcw, FileText, ChevronDown, ChevronUp, Video } from 'lucide-react'
import ResizableComponent from '../Resizable'
import type { Cell } from '@/types/cellTypes'

export interface MediaCellContent {
  sourceType: 'audio' | 'video'
  title: string
  url: string
  lectureId?: string
  transcript?: string
}

const SPEED_OPTIONS = [0.75, 1, 1.5, 2] as const

// Stable decorative waveform heights seeded from a string
function seededBars(seed: string, count = 30): number[] {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return Array.from({ length: count }, (_, i) => {
    const n = Math.sin((hash + i) * 9301 + 49297) * 233280
    const pct = n - Math.floor(n)
    return 20 + Math.round(pct * 60) // 20–80% height
  })
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

// ---------------------------------------------------------------------------
// Main export – matches TestCell pattern: ResizableComponent at top level
// ---------------------------------------------------------------------------

export default function MediaCell({ cell }: { cell: Cell }) {
  let media: MediaCellContent | null = null
  try {
    media = JSON.parse(cell.content) as MediaCellContent
  } catch {
    return (
      <ResizableComponent direction="vertical">
        <div className="flex flex-col h-full bg-white p-4 rounded shadow-xl border border-zinc-200/60 items-center justify-center">
          <p className="text-sm text-zinc-500">Nie udalo sie wczytac zasobu multimedialnego.</p>
        </div>
      </ResizableComponent>
    )
  }

  return (
    <ResizableComponent direction="vertical">
      <div className="flex flex-col h-full bg-white rounded shadow-xl border border-zinc-200/60 overflow-hidden animate-fadeInUp">
        {media.sourceType === 'video'
          ? <VideoStub title={media.title} />
          : <AudioPlayer media={media} cellId={cell.id} />
        }
      </div>
    </ResizableComponent>
  )
}

// ---------------------------------------------------------------------------
// Audio Player
// ---------------------------------------------------------------------------

function AudioPlayer({ media, cellId }: { media: MediaCellContent; cellId: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [speed, setSpeed] = useState<number>(1)
  const [showTranscript, setShowTranscript] = useState(false)
  const [ended, setEnded] = useState(false)

  const bars = seededBars(media.lectureId ?? cellId)
  const playedPct = duration > 0 ? (currentTime / duration) * 100 : 0
  const playedBars = Math.round((playedPct / 100) * bars.length)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onTime = () => setCurrentTime(audio.currentTime)
    const onLoaded = () => setDuration(audio.duration)
    const onEnded = () => { setIsPlaying(false); setEnded(true) }
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onLoaded)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onLoaded)
      audio.removeEventListener('ended', onEnded)
    }
  }, [])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
    } else {
      setEnded(false)
      audio.play()
    }
    setIsPlaying(p => !p)
  }, [isPlaying])

  const handleRestart = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = 0
    setEnded(false)
    audio.play()
    setIsPlaying(true)
  }, [])

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    const track = trackRef.current
    if (!audio || !track || duration === 0) return
    const rect = track.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    audio.currentTime = pct * duration
  }, [duration])

  const handleSpeed = useCallback((s: number) => {
    if (audioRef.current) audioRef.current.playbackRate = s
    setSpeed(s)
  }, [])

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-50 to-fuchsia-50 border-b border-zinc-200 px-5 py-4 shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-gradient-to-br from-[#ff9898] to-fuchsia-400 rounded-lg shrink-0">
              <Headphones className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Media Center</p>
              <h3 className="font-semibold text-zinc-900 text-sm leading-snug">{media.title}</h3>
            </div>
          </div>
          {duration > 0 && (
            <span className="text-xs font-medium text-zinc-500 bg-white/70 border border-zinc-200 rounded-full px-3 py-1 shrink-0">
              {formatTime(duration)}
            </span>
          )}
        </div>
      </div>

      {/* Waveform + seek */}
      <div className="px-5 pt-5 pb-2 shrink-0">
        {/* Decorative waveform bars */}
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
          ref={trackRef}
          onClick={handleSeek}
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

      {/* Controls */}
      <div className="px-5 pb-4 flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={handleRestart}
          title="Od poczatku"
          className="p-2 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={togglePlay}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-gradient-to-r from-[#ff9898] to-fuchsia-400 text-white text-sm font-medium rounded-full hover:opacity-90 transition-opacity"
        >
          {isPlaying
            ? <><Pause className="w-4 h-4" /> Pauza</>
            : <><Play className="w-4 h-4" /> {ended ? 'Od poczatku' : 'Odtwórz'}</>
          }
        </button>

        <div className="flex items-center gap-1">
          {SPEED_OPTIONS.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => handleSpeed(s)}
              className={[
                'px-2 py-0.5 rounded-full text-xs font-medium transition-colors',
                speed === s
                  ? 'bg-gradient-to-r from-[#ff9898] to-fuchsia-400 text-white'
                  : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200',
              ].join(' ')}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Transcript toggle */}
      {media.transcript && (
        <>
          <button
            type="button"
            onClick={() => setShowTranscript(p => !p)}
            className="w-full flex items-center justify-between px-5 py-3 border-t border-zinc-100 hover:bg-zinc-50/70 transition-colors shrink-0"
          >
            <span className="flex items-center gap-2 text-xs font-medium text-zinc-500">
              <FileText className="w-3.5 h-3.5" />
              Transkrypcja
            </span>
            {showTranscript
              ? <ChevronUp className="w-4 h-4 text-zinc-400" />
              : <ChevronDown className="w-4 h-4 text-zinc-400" />
            }
          </button>

          {showTranscript && (
            <div className="border-t border-zinc-100 bg-zinc-50/50 px-5 py-4 max-h-48 overflow-y-auto scrollbar-thin scrollbar-webkit">
              <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-line">
                {media.transcript}
              </p>
            </div>
          )}
        </>
      )}

      <audio ref={audioRef} src={media.url} preload="metadata" className="hidden" />
    </>
  )
}

// ---------------------------------------------------------------------------
// Video stub – wired up later
// ---------------------------------------------------------------------------

function VideoStub({ title }: { title: string }) {
  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-50 to-fuchsia-50 border-b border-zinc-200 px-5 py-4 shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-gradient-to-br from-[#ff9898] to-fuchsia-400 rounded-lg shrink-0">
              <Video className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Media Center</p>
              <h3 className="font-semibold text-zinc-900 text-sm leading-snug">{title}</h3>
            </div>
          </div>
          <span className="text-xs font-medium text-zinc-400 bg-zinc-100 border border-zinc-200 rounded-full px-3 py-1 shrink-0">
            wkrótce
          </span>
        </div>
      </div>

      {/* Placeholder body */}
      <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-zinc-50 px-5 py-10">
        <div className="p-4 rounded-full bg-zinc-100">
          <Video className="w-10 h-10 text-zinc-300" />
        </div>
        <p className="text-sm font-medium text-zinc-400">Odtwarzacz wideo wkrótce dostepny</p>
        <p className="text-xs text-zinc-300 text-center max-w-xs">
          Wsparcie dla wideo zostanie dodane w kolejnej aktualizacji.
        </p>
      </div>

      {/* Disabled controls bar */}
      <div className="px-5 py-4 border-t border-zinc-100 flex items-center gap-3 opacity-40 pointer-events-none shrink-0">
        <div className="p-2 rounded-full text-zinc-400">
          <RotateCcw className="w-4 h-4" />
        </div>
        <div className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-zinc-200 text-zinc-500 text-sm font-medium rounded-full">
          <Play className="w-4 h-4" />
          Odtwórz
        </div>
        <div className="flex items-center gap-1">
          {SPEED_OPTIONS.map(s => (
            <span key={s} className="px-2 py-0.5 rounded-full text-xs bg-zinc-100 text-zinc-400">
              {s}x
            </span>
          ))}
        </div>
      </div>
    </>
  )
}
