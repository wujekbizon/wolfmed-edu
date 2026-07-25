'use client'

import { Minus, Plus, RotateCcw } from 'lucide-react'
import { MANNEQUIN_VIEWS, MANNEQUIN_VIEW_KEYS } from '@/constants/mannequinViews'
import type { MannequinViewKey } from '@/types/mannequinTypes'

const iconButtonClass =
  'w-8 h-8 rounded-full bg-white/90 border border-zinc-300 text-zinc-600 backdrop-blur-sm ' +
  'flex items-center justify-center transition-colors cursor-pointer hover:border-zinc-400 ' +
  'disabled:opacity-40 disabled:cursor-not-allowed'

export default function MannequinViewControls({
  view,
  canZoomIn,
  canZoomOut,
  onSetView,
  onZoomIn,
  onZoomOut,
  onReset,
}: {
  view: MannequinViewKey
  canZoomIn: boolean
  canZoomOut: boolean
  onSetView: (view: MannequinViewKey) => void
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
}) {
  return (
    <>
      <div className="absolute top-2 right-2 flex flex-col gap-1.5">
        <button
          type="button"
          onClick={onZoomIn}
          disabled={!canZoomIn}
          aria-label="Przybliż"
          className={iconButtonClass}
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onZoomOut}
          disabled={!canZoomOut}
          aria-label="Oddal"
          className={iconButtonClass}
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onReset}
          aria-label="Resetuj widok"
          className={iconButtonClass}
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1.5">
        {MANNEQUIN_VIEW_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => onSetView(key)}
            aria-pressed={view === key}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border backdrop-blur-sm transition-colors cursor-pointer
              ${
                view === key
                  ? 'bg-rose-500 border-rose-500 text-white'
                  : 'bg-white/90 border-zinc-300 text-zinc-600 hover:border-zinc-400'
              }`}
          >
            {MANNEQUIN_VIEWS[key].label}
          </button>
        ))}
      </div>
    </>
  )
}
