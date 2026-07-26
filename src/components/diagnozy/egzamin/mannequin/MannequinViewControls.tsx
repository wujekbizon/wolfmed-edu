'use client'

import { Minus, Plus, RotateCcw } from 'lucide-react'
import { MANNEQUIN_VIEWS, MANNEQUIN_VIEW_KEYS } from '@/constants/mannequinViews'
import type { MannequinViewKey } from '@/types/mannequinTypes'

const iconButtonClass =
  'w-8 h-8 rounded-xl bg-white/80 ring-1 ring-zinc-900/[0.06] text-zinc-500 backdrop-blur-md ' +
  'flex items-center justify-center transition-all cursor-pointer hover:text-zinc-700 ' +
  'hover:ring-zinc-900/[0.12] shadow-[0_1px_2px_rgba(16,24,40,0.04)] ' +
  'disabled:opacity-30 disabled:cursor-not-allowed'

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
      <div className="absolute top-3 right-3 flex flex-col gap-1.5">
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

      <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5">
        {MANNEQUIN_VIEW_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => onSetView(key)}
            aria-pressed={view === key}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium backdrop-blur-md transition-all cursor-pointer ring-1
              ${
                view === key
                  ? 'bg-rose-500 ring-rose-500 text-white shadow-[0_6px_14px_-6px_rgba(244,63,94,0.7)]'
                  : 'bg-white/80 ring-zinc-900/[0.06] text-zinc-500 hover:text-zinc-700 hover:ring-zinc-900/[0.12]'
              }`}
          >
            {MANNEQUIN_VIEWS[key].label}
          </button>
        ))}
      </div>
    </>
  )
}
