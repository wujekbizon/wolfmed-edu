'use client'

import Link from 'next/link'
import { ArrowLeft, ListChecks, Swords } from 'lucide-react'

export default function OpiekunReaderMobileHeader({
  name,
  slug,
  stepCount,
  currentSection,
  totalSections,
}: {
  name: string
  slug: string
  stepCount: number
  currentSection: number
  totalSections: number
}) {
  return (
    <div className="lg:hidden flex flex-col gap-2 border-b border-zinc-200 bg-white px-4 py-3">
      <Link
        href="/panel/procedury/opiekun-medyczny"
        className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-700 transition-colors w-fit"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Wróć do listy
      </Link>
      <h1 className="text-sm font-bold text-zinc-800 leading-snug line-clamp-2">{name}</h1>
      <div className="flex items-center gap-3 flex-wrap">
        <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
          <ListChecks className="w-3.5 h-3.5" />
          {stepCount} kroków
        </span>
        <span className="text-xs text-zinc-400">
          Sekcja {currentSection + 1} z {totalSections}
        </span>
        <Link
          href={`/panel/procedury/opiekun-medyczny/${slug}/wyzwania`}
          className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition-colors"
        >
          <Swords className="w-3.5 h-3.5" />
          Wyzwania
        </Link>
      </div>
    </div>
  )
}
