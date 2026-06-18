'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, HeartPulse, Cross, Sparkles, X } from 'lucide-react'

const COURSES = [
  {
    title: 'Opiekun Medyczny',
    href: '/kierunki/opiekun-medyczny',
    icon: HeartPulse,
  },
  {
    title: 'Pielęgniarstwo',
    href: '/kierunki/pielegniarstwo',
    icon: Cross,
  },
]

export default function BlogPromoBanner() {
  // Mobile/small tablet: the banner starts as a full-width overlay at the top
  // (scrolls away with the page). The X re-docks it into the normal flow at the
  // bottom of the page so it takes real space instead of covering the posts.
  const [dockedBottom, setDockedBottom] = useState(false)
  // Desktop/mid: the X fully closes the floating card.
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const mobilePosition = dockedBottom ? 'relative rounded-t-2xl' : 'absolute top-0 inset-x-0 rounded-b-2xl'

  return (
    <aside
      aria-label="Poznaj platformę Wolfmed"
      className={`${mobilePosition} z-30 w-full
        md:fixed md:inset-x-auto md:top-auto md:bottom-6 md:right-6 md:w-80 md:rounded-2xl lg:w-96
        animate-[scaleIn_0.25s_ease-out_forwards]`}
    >
      <div
        className="relative overflow-hidden
          bg-gradient-to-br from-zinc-900/95 to-black/90
          backdrop-blur-xl border border-white/[0.08]
          rounded-[inherit] shadow-2xl shadow-black/50"
      >
        <button
          type="button"
          onClick={() => setDockedBottom((v) => !v)}
          aria-label={dockedBottom ? 'Przenieś baner na górę' : 'Przenieś baner na dół'}
          className="absolute right-3 top-3 z-10 p-1 rounded-lg text-zinc-500 transition-colors
            hover:bg-white/10 hover:text-zinc-200 md:hidden"
        >
          <X className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Zamknij baner"
          className="absolute right-3 top-3 z-10 hidden p-1 rounded-lg text-zinc-500 transition-colors
            hover:bg-white/10 hover:text-zinc-200 md:block"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative p-5 sm:p-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1">
            <Sparkles className="h-3.5 w-3.5 text-zinc-300" />
            <span className="text-[11px] font-medium tracking-wide text-zinc-300">Platforma edukacyjna Wolfmed</span>
          </div>

          <h2 className="mt-3 pr-8 text-lg font-semibold leading-snug text-zinc-100 sm:text-xl">
            Twoja droga do zawodu medycznego zaczyna się tutaj
          </h2>

          <p className="mt-2 text-xs leading-relaxed text-zinc-400">
            Profesjonalne kursy online dla przyszłych pracowników służby zdrowia.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-1">
            {COURSES.map(({ title, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] p-2.5
                  transition-all hover:border-white/20 hover:bg-white/[0.06]"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-zinc-200 shadow-sm">
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <span className="text-xs font-semibold text-zinc-100">{title}</span>
                <ArrowRight className="ml-auto h-3.5 w-3.5 text-zinc-500 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}
