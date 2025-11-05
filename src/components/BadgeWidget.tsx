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
      {/* Main Card Container */}
      <div className="bg-white border border-zinc-200/50 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-zinc-900">Zdobyte odznaki</h2>
          {badgeCount > 0 && (
            <div className="px-3 py-1 rounded-full bg-gradient-to-r from-[#f58a8a] to-[#ffc5c5] text-white text-sm font-semibold shadow-[0_2px_8px_rgba(245,138,138,0.3)]">
              {badgeCount}
            </div>
          )}
        </header>

        {/* Content Area */}
        {badgeCount === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-12 px-6 min-h-[200px]">
            <Award className="w-16 h-16 text-zinc-300/60 mb-4" />
            <p className="text-base font-semibold text-zinc-700 mb-2 text-center">
              Nie zdobyłeś jeszcze żadnych odznak
            </p>
            <p className="text-sm font-normal text-zinc-500 text-center leading-relaxed mb-4">
              Ukończ wyzwania procedur, aby zdobyć odznaki
            </p>
            <Link
              href="/panel/procedury"
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#f58a8a] to-[#ffc5c5] text-white text-sm font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              Przeglądaj procedury
            </Link>
          </div>
        ) : (
          /* Badge Grid */
          <div className="max-h-[400px] overflow-y-auto scrollbar-webkit pr-2 scroll-smooth">
            <div className="grid grid-cols-3 xs:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4 xs:gap-[18px] md:gap-5 xl:gap-6 justify-items-center items-start">
              {badges.map((badge, index) => (
                /* Individual Badge Item */
                <div
                  key={badge.id}
                  className="flex flex-col items-center gap-2 group"
                  style={
                    {
                      '--slidein-delay': `${Math.min(index * 0.03, 0.6)}s`,
                    } as React.CSSProperties
                  }
                >
                  {/* Badge Image Container */}
                  <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-zinc-50 to-zinc-100 border-2 border-zinc-200 p-2 shadow-sm overflow-hidden transition-all duration-200 ease-out group-hover:scale-105 group-hover:-translate-y-0.5 group-hover:border-[rgb(245,138,138,0.5)] group-hover:shadow-[0_4px_16px_rgba(245,138,138,0.25)] group-hover:from-pink-50/30 group-hover:to-white group-active:scale-98 group-active:shadow-none">
                    <Image
                      src={badge.badgeImageUrl}
                      alt={badge.procedureName}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover aspect-square origin-center transition-all duration-200 ease-out group-hover:saturate-110"
                    />
                  </div>

                  {/* Badge Name */}
                  <span className="w-16 text-[11px] font-medium text-zinc-600 text-center leading-tight truncate px-0.5 transition-all duration-150 ease-out group-hover:text-[#f58a8a] group-hover:font-semibold">
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
