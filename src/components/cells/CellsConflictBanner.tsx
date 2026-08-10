'use client'

import { useEffect, useRef } from 'react'
import { useCellsStore } from '@/store/useCellsStore'

export default function CellsConflictBanner() {
  const { conflict, useServerConflict, keepLocalConflict } = useCellsStore()
  const bannerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!conflict) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const frame = requestAnimationFrame(() => {
      bannerRef.current?.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'center',
      })
      bannerRef.current?.focus({ preventScroll: true })
    })

    return () => cancelAnimationFrame(frame)
  }, [conflict])

  if (!conflict) return null

  return (
    <div
      ref={bannerRef}
      role="alert"
      tabIndex={-1}
      className="mb-4 scroll-m-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
    >
      <p className="font-medium">Plansza została zmieniona w innej karcie lub na innym urządzeniu.</p>
      <p className="mt-1">Wybierz wersję przed kolejnym zapisem.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={useServerConflict}
          className="rounded bg-slate-800 px-3 py-2 text-white"
        >
          Wczytaj wersję serwera
        </button>
        <button
          type="button"
          onClick={keepLocalConflict}
          className="rounded border border-amber-500 bg-white px-3 py-2"
        >
          Zachowaj wersję lokalną
        </button>
      </div>
    </div>
  )
}
