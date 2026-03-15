import Link from 'next/link'
import { careerPathsData } from '@/constants/careerPathsData'
import OnboardingChecklist from '@/components/OnboardingChecklist'
import { BookOpen, Sparkles, ClipboardList, Headphones } from 'lucide-react'

const FEATURES = [
  {
    icon: <BookOpen className="w-5 h-5" />,
    label: 'Baza Testów',
    desc: 'Tysiące pytań egzaminacyjnych',
    href: '/panel/testy',
    premium: false,
  },
  {
    icon: <Sparkles className="w-5 h-5" />,
    label: 'AI Notatnik',
    desc: 'Ucz się z AI asystentem',
    href: '/panel/nauka',
    premium: true,
  },
  {
    icon: <ClipboardList className="w-5 h-5" />,
    label: 'Procedury',
    desc: 'Algorytmy i schematy działania',
    href: '/panel/procedury',
    premium: false,
  },
  {
    icon: <Headphones className="w-5 h-5" />,
    label: 'Wykłady AI',
    desc: 'Słuchaj i ucz się',
    href: '/panel/nauka/wykladania',
    premium: false,
  },
]

export default function UserOnboard() {
  return (
    <div className="h-full p-3 sm:p-8 bg-zinc-800 rounded-2xl shadow-xl border border-white/[0.06]">
      {/* Heading */}
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 leading-tight">
          Twoja nauka, Twoje tempo.
        </h2>
        <p className="text-base sm:text-lg text-zinc-300 font-light max-w-xl mx-auto">
          Wybierz kierunek, kup dostęp i ucz się w swoim tempie.
          Bez subskrypcji — płacisz tylko za to, czego potrzebujesz.
        </p>
      </div>

      {/* Feature Discovery Grid */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-4">
          Co oferuje platforma
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {FEATURES.map((feature) => (
            <Link
              key={feature.href}
              href={feature.href}
              className="relative flex flex-col gap-2 p-4 bg-zinc-700/80 border border-white/[0.06] rounded-2xl hover:bg-zinc-700 hover:border-white/[0.12] transition-all duration-200 group"
            >
              {feature.premium && (
                <span className="absolute top-2 right-2 text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
                  Premium
                </span>
              )}
              <span className="text-zinc-400 group-hover:text-zinc-200 transition-colors">
                {feature.icon}
              </span>
              <span className="text-sm font-semibold text-zinc-100">
                {feature.label}
              </span>
              <span className="text-xs text-zinc-400">{feature.desc}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Course Marketplace Cards */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-4">
          Dostępne kierunki
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(careerPathsData).map(([slug, path]) => (
            <div
              key={slug}
              className="flex flex-col justify-between p-5 bg-zinc-700/80 border border-white/[0.08] rounded-2xl"
            >
              <div className="mb-4">
                <h4 className="text-base font-semibold text-white mb-1.5">
                  {path.title}
                </h4>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {path.description}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-medium text-zinc-400 border border-zinc-600 rounded-full px-2 py-0.5">
                  Basic
                </span>
                <span className="text-[11px] font-medium text-rose-400 border border-rose-500/30 rounded-full px-2 py-0.5">
                  Premium
                </span>
                <Link
                  href={`/kierunki/${slug}`}
                  className="ml-auto text-sm font-semibold text-rose-400 hover:text-rose-300 transition-colors"
                >
                  Kup dostęp →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Onboarding Checklist */}
      <OnboardingChecklist />
    </div>
  )
}
