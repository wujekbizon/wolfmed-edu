import { BookOpen, ClipboardList, Circle, GraduationCap, Headphones, MessageSquare, Sparkles, Star, Target } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { careerPathsData } from '@/constants/careerPathsData'

export default function DynamicBoardSkeleton() {
  const features: Array<{ icon: LucideIcon; label: string; desc: string }> = [
    { icon: BookOpen, label: 'Baza Testów', desc: 'Tysiące pytań egzaminacyjnych' },
    { icon: Sparkles, label: 'AI Notatnik', desc: 'Ucz się z AI asystentem' },
    { icon: ClipboardList, label: 'Procedury', desc: 'Algorytmy i schematy działania' },
    { icon: Headphones, label: 'Wykłady AI', desc: 'Słuchaj i ucz się' },
  ]

  const cards = [
    { icon: BookOpen, label: 'Pytań rozwiązanych', accent: false },
    { icon: Target, label: 'Prób testów', accent: false },
    { icon: Star, label: 'Łączny wynik', accent: true },
    { icon: GraduationCap, label: 'Twoich kursów', accent: false },
  ]

  return (
    <section className="container mx-auto rounded-2xl border border-zinc-200/60 bg-white p-3 shadow-xl shadow-zinc-900/[0.07] xs:p-4 sm:p-8">
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map(({ icon: Icon, label, accent }) => (
          <div
            key={label}
            className={`flex min-h-28 flex-col gap-1.5 rounded-xl p-4 ${
              accent ? 'bg-linear-to-r from-[#f65555]/90 to-[#ffc5c5]/90' : 'border border-zinc-100 bg-white shadow-sm'
            }`}
          >
            <span className={accent ? 'text-zinc-900' : 'text-zinc-500'}>
              <Icon className="h-5 w-5" />
            </span>
            <span
              className={`h-8 w-10 animate-pulse rounded text-2xl font-bold ${
                accent ? 'bg-[#f65555]/30' : 'bg-zinc-100'
              }`}
            />
            <span className={`text-[13px] ${accent ? 'text-zinc-800' : 'text-zinc-600'}`}>{label}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="flex h-full flex-col gap-8 rounded-2xl border border-zinc-100 bg-white p-4 lg:col-span-8 lg:p-6">
          <div className="text-center pt-2">
            <h2 className="text-2xl font-bold leading-tight text-zinc-900 sm:text-3xl lg:text-4xl">
              Twoja nauka, Twoje tempo.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-zinc-400">
              Wybierz kierunek, kup dostęp i ucz się w swoim tempie. Bez subskrypcji — płacisz tylko za to, czego potrzebujesz.
            </p>
          </div>
          <div>
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Co oferuje platforma</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {features.map(({ icon: Icon, label, desc }) => (
                <div key={label as string} className="relative flex flex-col gap-2 rounded-xl border border-zinc-100 bg-zinc-50 p-4 shadow-sm">
                  <span className="text-zinc-400"><Icon className="h-5 w-5" /></span>
                  <span className="text-sm font-semibold text-zinc-800">{label}</span>
                  <span className="break-words text-xs text-zinc-500">{desc}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Dostępne kierunki</h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {Object.entries(careerPathsData).map(([slug, path]) => (
                <div key={slug} className="rounded-xl border border-zinc-100 bg-white px-5 py-6 shadow-sm">
                  <h4 className="mb-2 text-sm font-semibold text-zinc-800">{path.title}</h4>
                  <p className="text-xs leading-relaxed text-zinc-400">{path.description}</p>
                  <div className="mt-4 flex gap-2">
                    <span className="rounded-full border border-zinc-200 px-2 py-0.5 text-[10px] font-medium text-zinc-400">Basic</span>
                    <span className="rounded-full border border-[#f6555533] px-2 py-0.5 text-[10px] font-medium text-[#f65555]">Premium</span>
                    <span className="ml-auto h-4 w-20 animate-pulse rounded bg-zinc-100" />
                  </div>
                </div>
              ))}
            </div>
          </div>
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
