'use client'

import Link from 'next/link'
import { ArrowLeft, Check, ListChecks, Swords } from 'lucide-react'
import type { OpiekunReaderSection } from '@/types/procedureReaderTypes'

export default function OpiekunReaderSidebar({
  name,
  slug,
  stepCount,
  sections,
  currentSection,
}: {
  name: string
  slug: string
  stepCount: number
  sections: OpiekunReaderSection[]
  currentSection: number
}) {
  return (
    <aside className="hidden lg:flex flex-col w-72 xl:w-80 shrink-0 h-full border-r border-zinc-200 bg-white">
      <div className="flex flex-col h-full overflow-y-auto scrollbar-webkit p-6 gap-6">
        <Link
          href="/panel/procedury/opiekun-medyczny"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-700 transition-colors w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Wróć do listy
        </Link>

        <div>
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Procedura
          </p>
          <h1 className="text-sm font-bold text-zinc-800 leading-snug">{name}</h1>
        </div>

        <div className="inline-flex items-center gap-2 text-sm text-zinc-500">
          <ListChecks className="w-4 h-4 shrink-0" />
          {stepCount} kroków algorytmu
        </div>

        <div className="border-t border-zinc-100" />

        <div>
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
            Sekcje
          </p>
          <ol className="space-y-1">
            {sections.map((section, index) => {
              const isCompleted = index < currentSection
              const isActive = index === currentSection
              return (
                <li
                  key={section.title}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive ? 'bg-slate-700 text-white' : 'text-zinc-400'
                  }`}
                >
                  <span
                    className={`shrink-0 w-5 h-5 rounded-full border flex items-center justify-center text-xs font-semibold leading-none ${
                      isActive
                        ? 'border-white/30 bg-white/10 text-white'
                        : isCompleted
                        ? 'border-zinc-200 bg-zinc-100 text-zinc-400'
                        : 'border-zinc-200 text-zinc-400'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3 h-3" /> : index + 1}
                  </span>
                  <span className="text-xs leading-snug">{section.title}</span>
                </li>
              )
            })}
          </ol>
        </div>

        <div className="mt-auto">
          <Link
            href={`/panel/procedury/opiekun-medyczny/${slug}/wyzwania`}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors"
          >
            <Swords className="w-4 h-4" />
            Wyzwania procedury
          </Link>
        </div>
      </div>
    </aside>
  )
}
