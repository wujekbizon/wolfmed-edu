import { BookOpen, Circle, GraduationCap, MessageSquare, Star, Target } from 'lucide-react'
import UserOnboard from '@/components/UserOnboard'
import StatCard from '@/components/StatCard'

export default function DynamicBoardSkeleton() {
  const cards = [
    { icon: BookOpen, label: 'Pytań rozwiązanych', accent: false, iconTone: 'lavender' as const },
    { icon: Target, label: 'Prób testów', accent: false, iconTone: 'rose' as const },
    { icon: Star, label: 'Łączny wynik', accent: true, iconTone: 'rose' as const },
    { icon: GraduationCap, label: 'Twoich kursów', accent: false, iconTone: 'lavender' as const },
  ]

  return (
    <section className="container mx-auto rounded-2xl border border-zinc-200/60 bg-white p-3 shadow-xl shadow-zinc-900/[0.07] xs:p-4 sm:p-8">
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <UserOnboard enrollments={[]} loading />
        </div>
        <div className="space-y-4 rounded-2xl bg-white/70 p-4 lg:col-span-4">
          <div className="min-h-[218px] rounded-2xl border border-white/50 bg-gradient-to-br from-white/90 to-rose-50/50 p-5 shadow-2xl shadow-zinc-950/20">
            <h3 className="mb-3 text-base font-semibold text-zinc-800">Twoje kursy</h3>
            <div className="space-y-3">
              {[0, 1].map((index) => (
                <div key={index} className="flex min-h-[66px] items-center justify-between gap-3 rounded-xl border border-white/50 bg-white/50 px-4 py-2.5">
                  <div className="min-w-0 space-y-2">
                    <div className="h-4 w-32 animate-pulse rounded bg-zinc-200" />
                    <div className="h-3 w-14 animate-pulse rounded bg-rose-100" />
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-zinc-600">Kontynuuj →</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/50 bg-gradient-to-br from-white/90 to-rose-50/50 p-5 shadow-2xl shadow-zinc-950/20">
            <div className="mb-2 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-zinc-400" />
              <h3 className="text-base font-semibold text-zinc-800">Forum</h3>
            </div>
            <div className="mb-3 h-4 w-full animate-pulse rounded bg-zinc-100" />
            <span className="text-xs font-semibold text-[#f65555]">Dołącz do dyskusji →</span>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-white/90 to-rose-50/50 p-4 shadow-2xl shadow-zinc-950/20">
            <h4 className="mb-3 text-sm font-semibold text-zinc-800">Pierwsze kroki <span className="font-normal text-zinc-500">—/5</span></h4>
            <div className="mb-4 h-1 w-full animate-pulse rounded-full bg-rose-200" />
            <ul className="space-y-2.5">
              {['Uzupełnij nazwę użytkownika i motto', 'Przeglądaj dostępne kierunki', 'Rozwiąż swój pierwszy test', 'Sprawdź procedury medyczne', 'Odkryj AI Notatnik'].map((label) => (
                <li key={label} className="flex items-center gap-3 text-sm text-zinc-500">
                  <Circle className="h-4 w-4 shrink-0 text-zinc-400" />
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-zinc-900/95 to-black/90 p-4 shadow-2xl shadow-black/40 sm:p-6">
            <h3 className="text-center text-lg font-bold text-white sm:text-xl">Zaplanuj swoją naukę</h3>
            <p className="mt-2 text-center text-xs text-zinc-400 sm:text-sm">Ustal cel, termin i tempo — a Wolfmed pomoże Ci utrzymać kurs.</p>
            <div className="mt-4 h-9 animate-pulse rounded-lg bg-red-500/80" />
          </div>
        </div>
      </div>
    </section>
  )
}
