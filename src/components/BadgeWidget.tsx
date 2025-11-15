import { auth } from '@clerk/nextjs/server'
import { getUserBadges } from '@/server/queries'
import { Award } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default async function BadgeWidget() {
  const { userId } = await auth()
  if (!userId) return null

  const badges = await getUserBadges(userId)
  const badgeCount = badges.length

  return (
    <section className="relative w-full">
      <div className="bg-gradient-to-br from-white/25 via-white/35 to-white/25 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:border-white/70 hover:from-white/30 hover:via-white/40 hover:to-white/30 transition-all duration-300">

        <header className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900">Zdobyte odznaki</h2>
          {badgeCount > 0 && (
            <div className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#f58a8a] via-[#ff9898] to-[#ffc5c5] text-white text-sm font-bold shadow-lg">
              {badgeCount}
            </div>
          )}
        </header>

        {badgeCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 min-h-[240px]">
            <div className="relative mb-5">
              <div className="absolute inset-0 bg-gradient-to-r from-[#f58a8a]/20 via-[#ff9898]/20 to-[#ffc5c5]/20 blur-2xl rounded-full" />
              <Award className="relative w-20 h-20 text-zinc-300 drop-shadow-sm" strokeWidth={1.5} />
            </div>
            <p className="text-lg font-bold text-zinc-800 mb-2 text-center">
              Nie zdobyłeś jeszcze żadnych odznak
            </p>
            <p className="text-sm text-zinc-600 text-center leading-relaxed mb-6 max-w-xs">
              Ukończ wyzwania procedur, aby zdobyć odznaki i rozwijać swoje umiejętności
            </p>
            <Link
              href="/panel/procedury"
              className="group/cta px-6 py-3 rounded-full bg-gradient-to-r from-[#f58a8a] via-[#ff9898] to-[#ffc5c5] text-white text-sm font-bold shadow-lg hover:shadow-xl hover:from-[#ff5b5b] hover:via-[#ff8080] hover:to-[#ffb0b0] hover:-translate-y-0.5 transition-all duration-200 active:translate-y-0 active:shadow-md"
            >
              <span className="flex items-center gap-2">
                Przeglądaj procedury
                <svg className="w-4 h-4 transition-transform group-hover/cta:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </Link>
          </div>
        ) : (
          <div className="max-h-[420px] overflow-y-auto scrollbar-webkit pr-1 scroll-smooth">
            <div className="grid grid-cols-3 xs:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-5 xs:gap-6 md:gap-6 xl:gap-7 justify-items-center items-start p-1">
              {badges.map((badge, index) => (
                <div
                  key={badge.id}
                  className="flex flex-col items-center gap-2.5 group/badge w-full max-w-[72px]"
                  style={
                    {
                      '--slidein-delay': `${Math.min(index * 0.03, 0.6)}s`,
                    } as React.CSSProperties
                  }
                >
                  <div className="relative w-full aspect-square rounded-xl bg-gradient-to-br from-white/40 via-white/60 to-white/40 backdrop-blur-md border-2 border-white/60 p-2.5 shadow-md overflow-hidden transition-all duration-300 ease-out group-hover/badge:shadow-xl group-hover/badge:border-[#ff9898]/60 group-hover/badge:from-white/50 group-hover/badge:via-white/70 group-hover/badge:to-white/50 group-hover/badge:scale-[1.02] group-active/badge:scale-[0.98] group-active/badge:shadow-sm">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#f58a8a]/0 to-[#ffc5c5]/0 group-hover/badge:from-[#f58a8a]/10 group-hover/badge:to-[#ffc5c5]/10 transition-all duration-300 rounded-lg" />
                    <Image
                      src={badge.badgeImageUrl}
                      alt={badge.procedureName}
                      width={48}
                      height={48}
                      className="relative w-full h-full object-cover aspect-square rounded-md transition-all duration-300 ease-out group-hover/badge:saturate-110 group-hover/badge:brightness-105"
                    />
                  </div>

                  <span className="w-full text-[11px] font-semibold text-zinc-700 text-center leading-tight line-clamp-2 px-1 transition-all duration-200 ease-out group-hover/badge:text-[#ff5b5b] group-hover/badge:scale-[1.02]">
                    {badge.procedureName}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
