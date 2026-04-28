'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useNoCoursesBannerStore } from '@/store/useNoCoursesBannerStore'

export default function NoCoursesBanner() {
  const params = useSearchParams()
  const { isOpen, show, hide } = useNoCoursesBannerStore()

  useEffect(() => {
    if (params.get('from') === 'panel') {
      show()
    }
  }, [params, show])

  if (!isOpen) return null

  return (
    <div className="fixed top-20 left-0 right-0 z-40 bg-gradient-to-br from-zinc-900/95 to-black/90 backdrop-blur-xl border-b border-white/[0.08] shadow-2xl shadow-black/50 px-3 py-2 sm:px-4 sm:py-3 flex items-center justify-between gap-3">
      <p className="text-xs sm:text-sm md:text-base text-zinc-200 text-center flex-1 leading-snug">
        Nie posiadasz jeszcze żadnego kursu —{' '}
        <span className="text-rose-400 font-medium">wybierz kierunek który Cię interesuje</span>{' '}
        i zacznij naukę już dziś.
      </p>
      <button
        onClick={hide}
        aria-label="Zamknij"
        className="shrink-0 text-zinc-400 hover:text-zinc-200 transition-colors text-base leading-none p-1"
      >
        ✕
      </button>
    </div>
  )
}
