import Link from 'next/link'
import { careerPathsData } from '@/constants/careerPathsData'
import { BookOpen, Sparkles, ClipboardList, Headphones } from 'lucide-react'
import { getUserEnrollmentsAction } from '@/actions/course-actions'


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
    premium: true,
  },
]

type Enrollments = Awaited<ReturnType<typeof getUserEnrollmentsAction>>['enrollments']

interface UserOnboardProps {
  enrollments: Enrollments
}

export default function UserOnboard({ enrollments }: UserOnboardProps) {
  const premiumSlugs = new Set(
    enrollments
      .filter((e) => e.isActive && e.accessTier === 'premium')
      .map((e) => e.courseSlug)
  )
  const hasPremium = premiumSlugs.size > 0

  return (
    <div className="h-full p-3 sm:p-8 bg-white/40 backdrop-blur-lg rounded-2xl shadow-md border border-zinc-200">
      {/* Heading */}
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-900 mb-3 leading-tight">
          Twoja nauka, Twoje tempo.
        </h2>
        <p className="text-base sm:text-lg text-zinc-500 font-light max-w-xl mx-auto">
          Wybierz kierunek, kup dostęp i ucz się w swoim tempie.
          Bez subskrypcji — płacisz tylko za to, czego potrzebujesz.
        </p>
      </div>

      {/* Feature Discovery Grid */}
      <div className="mb-8">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">
          Co oferuje platforma
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {FEATURES.map((feature) => {
            const locked = feature.premium && !hasPremium
            return (
              <Link
                key={feature.href}
                href={locked ? '#' : feature.href}
                className={`relative flex flex-col gap-2 p-4 border rounded-2xl transition-all duration-200 group ${
                  locked
                    ? 'bg-zinc-100/60 border-zinc-200/40 opacity-60 cursor-not-allowed pointer-events-none'
                    : 'bg-white/60 backdrop-blur-md border-white/50 hover:bg-white/80 hover:shadow-sm'
                }`}
              >
                {feature.premium && (
                  <span
                    className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full border"
                    style={{ color: '#f65555', backgroundColor: '#fff0f0', borderColor: '#f6555533' }}
                  >
                    Premium
                  </span>
                )}
                <span
                  className={`transition-colors ${locked ? 'text-zinc-400' : 'text-zinc-500 group-hover:text-[#f65555]'}`}
                >
                  {feature.icon}
                </span>
                <span className={`text-sm font-semibold ${locked ? 'text-zinc-400' : 'text-zinc-800'}`}>
                  {feature.label}
                </span>
                <span className={`text-xs ${locked ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  {feature.desc}
                </span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Course Marketplace Cards */}
      <div className="mb-8">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">
          Dostępne kierunki
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(careerPathsData).map(([slug, path]) => {
            const hasAccess = premiumSlugs.has(slug)
            return (
              <div
                key={slug}
                className="flex flex-col justify-between p-5 bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl"
              >
                <div className="mb-4">
                  <h4 className="text-base font-semibold text-zinc-800 mb-1.5">
                    {path.title}
                  </h4>
                  <p className="text-sm text-zinc-500 leading-relaxed">
                    {path.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-medium text-zinc-500 border border-zinc-300/50 rounded-full px-2 py-0.5">
                    Basic
                  </span>
                  <span
                    className="text-[11px] font-medium border rounded-full px-2 py-0.5"
                    style={{ color: '#f65555', borderColor: '#f6555533' }}
                  >
                    Premium
                  </span>
                  {hasAccess ? (
                    <span className="ml-auto text-sm font-semibold text-zinc-400 cursor-default">
                      Masz dostęp ✓
                    </span>
                  ) : (
                    <Link
                      href={`/kierunki/${slug}`}
                      className="ml-auto text-sm font-semibold transition-colors"
                      style={{ color: '#f65555' }}
                    >
                      Kup dostęp →
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
