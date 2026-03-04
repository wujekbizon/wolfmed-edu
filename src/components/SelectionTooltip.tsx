'use client'

import { BookmarkPlus } from 'lucide-react'
import { SELECTION_TOOLTIP_TEXT } from '@/constants/studyViewer'
import type { SelectionRect } from '@/hooks/useTextSelection'

interface SelectionTooltipProps {
  selectionRect: SelectionRect
  onCreateFlashcard: () => void
}

const TOOLTIP_HEIGHT = 36
const TOOLTIP_OFFSET = 8

export default function SelectionTooltip({ selectionRect, onCreateFlashcard }: SelectionTooltipProps) {
  const top = selectionRect.top - TOOLTIP_HEIGHT - TOOLTIP_OFFSET + window.scrollY
  const left = selectionRect.left + selectionRect.width / 2

  return (
    <div
      className="fixed z-40 animate-[scaleIn_0.15s_ease-out_forwards]"
      style={{ top, left, transform: 'translateX(-50%)' }}
    >
      <button
        onMouseDown={(e) => {
          // Prevent selection loss on click
          e.preventDefault()
          onCreateFlashcard()
        }}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-lg shadow-lg transition-colors duration-150 whitespace-nowrap"
      >
        <BookmarkPlus className="w-3.5 h-3.5" />
        {SELECTION_TOOLTIP_TEXT.createFlashcard}
      </button>
      {/* Caret */}
      <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-purple-600" />
    </div>
  )
}
