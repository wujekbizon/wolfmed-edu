'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, HeartPulse, Cross, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'

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
  // Mobile/small-tablet only: the banner starts at the top of the page and the
  // toggle re-docks it to the bottom (it is never fully removed). On md+ it is a
  // fixed floating card pinned to the bottom-right regardless of this state.
  const [dockedBottom, setDockedBottom] = useState(false)

  const mobilePosition = dockedBottom
    ? 'fixed bottom-0 inset-x-0 rounded-t-2xl'
    : 'absolute top-0 inset-x-0 rounded-b-2xl'

  return (
    <aside
      aria-label="Poznaj platformę WolfMed"
      className={`${mobilePosition} z-[70] w-full
        md:fixed md:inset-x-auto md:top-auto md:bottom-6 md:right-6 md:w-80 md:rounded-2xl lg:w-96
        animate-[scaleIn_0.25s_ease-out_forwards]`}
    >
      <div
        className="relative overflow-hidden border border-[#3A3A5A]/60
          bg-linear-to-br from-[#2A2A3F] via-[#1F1F2D] to-[#15151f]
          rounded-[inherit] shadow-2xl shadow-black/50 backdrop-blur-xl"
      >
        <div className="absolute -left-12 -top-16 h-48 w-48 rounded-full bg-[#BB86FC]/15 blur-3xl" aria-hidden="true" />
        <div className="absolute -right-12 -bottom-20 h-56 w-56 rounded-full bg-[#8686D7]/15 blur-3xl" aria-hidden="true" />

        <button
          type="button"
          onClick={() => setDockedBottom((v) => !v)}
          aria-label={dockedBottom ? 'Przenieś baner na górę' : 'Przenieś baner na dół'}
          className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-lg
            text-[#A5A5C3] transition-colors hover:bg-white/10 hover:text-zinc-100 md:hidden"
        >
          {dockedBottom ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        <div className="relative p-5 sm:p-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#BB86FC]/20 bg-[#3A3A5E]/30 px-3 py-1 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-[#BB86FC]/80" />
            <span className="text-[11px] font-medium tracking-wide text-[#BB86FC]/80">Platforma edukacyjna WolfMed</span>
          </div>

          <h2 className="mt-3 pr-8 text-lg font-bold leading-snug sm:text-xl md:pr-0">
            <span className="bg-linear-to-r from-[#E6E6F5] via-[#BB86FC]/70 to-[#E6E6F5] bg-clip-text text-transparent">
              Twoja droga do zawodu medycznego zaczyna się tutaj
            </span>
          </h2>

          <p className="mt-2 text-xs leading-relaxed text-[#A5A5C3]/80">
            Profesjonalne kursy online dla przyszłych pracowników służby zdrowia.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-1">
            {COURSES.map(({ title, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center gap-2.5 rounded-xl border border-[#3A3A5A]/60 bg-[#16161f]/60 p-2.5
                  transition-all hover:border-[#BB86FC]/40 hover:bg-[#1F1F2D]"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#BB86FC]/20 bg-[#3A3A5E]/30 text-[#BB86FC]">
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <span className="text-xs font-semibold text-[#E6E6F5]">{title}</span>
                <ArrowRight className="ml-auto h-3.5 w-3.5 text-[#BB86FC]/70 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>

          <Link
            href="/sign-up"
            className="group mt-4 flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#BB86FC] to-[#8686D7]
              px-5 py-2.5 text-sm font-semibold text-[#15151f] shadow-lg shadow-[#BB86FC]/20
              transition-all hover:shadow-[#BB86FC]/30 hover:brightness-110"
          >
            Zapisz się już dziś
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </aside>
  )
}
