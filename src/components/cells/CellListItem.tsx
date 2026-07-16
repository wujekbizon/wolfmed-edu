'use client'

import { useEffect, useState } from 'react'
import ActionBar from './ActionBar'
import CellContent from './CellContent'
import { CellFullscreenProvider } from '@/context/CellFullscreenContext'
import type { Cell } from '@/types/cellTypes'

export default function CellListItem({ cell, isPremium = false }: { cell: Cell; isPremium?: boolean }) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    if (!isFullscreen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreen(false)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [isFullscreen])

  const containerClass = isFullscreen
    ? 'fixed inset-0 z-50 flex flex-col p-1.5 bg-red-100'
    : 'border border-zinc-400/20 p-1.5 rounded bg-red-300/30'

  return (
    <div id={`cell-${cell.id}`} className="relative">
      <div className={containerClass}>
        <div className="relative min-h-10 w-full shrink-0">
          <ActionBar
            cell={cell}
            isFullscreen={isFullscreen}
            onToggleFullscreen={() => setIsFullscreen((v) => !v)}
          />
        </div>
        <div className={isFullscreen ? 'min-h-0 flex-1' : ''}>
          <CellFullscreenProvider value={{ isFullscreen }}>
            <CellContent cell={cell} isPremium={isPremium} />
          </CellFullscreenProvider>
        </div>
      </div>
    </div>
  )
}
