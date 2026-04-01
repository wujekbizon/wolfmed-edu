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
    <div className="h-full p-6 bg-white border border-zinc-100 rounded-2xl flex flex-col gap-8">
      {/* Heading */}
      <div className="text-center pt-2">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-900 mb-3 leading-tight">
          Twoja nauka, Twoje tempo.
        </h2>
        <p className="text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
          Wybierz kierunek, kup dostęp i ucz się w swoim tempie.
          Bez subskrypcji — płacisz tylko za to, czego potrzebujesz.
        </p>
      </div>

      {/* Feature Discovery Grid */}
      <div>
        <h3 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-3">
          Co oferuje platforma
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {FEATURES.map((feature) => {
            const locked = feature.premium && !hasPremium
            return (
              <Link
                key={feature.href}
                href={locked ? '#' : feature.href}
                className={`relative flex flex-col gap-2 p-4 border rounded-xl transition-all duration-200 group ${
                  locked
                    ? 'bg-zinc-50 border-zinc-100 shadow-sm opacity-50 cursor-not-allowed pointer-events-none'
                    : 'bg-zinc-50 border-zinc-100 shadow-sm hover:bg-white hover:border-zinc-200 hover:shadow-md'
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
                <span className={`transition-colors ${locked ? 'text-zinc-400' : 'text-zinc-400 group-hover:text-[#f65555]'}`}>
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
      <div>
        <h3 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-3">
          Dostępne kierunki
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(careerPathsData).map(([slug, path]) => {
            const hasAccess = premiumSlugs.has(slug)
            return (
              <div
                key={slug}
                className="flex flex-col justify-between px-5 py-6 bg-white border border-zinc-100 rounded-xl shadow-sm hover:border-zinc-200 hover:shadow-md transition-all duration-200"
              >
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-zinc-800 mb-2">
                    {path.title}
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {path.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-medium text-zinc-400 border border-zinc-200 rounded-full px-2 py-0.5">
                    Basic
                  </span>
                  <span
                    className="text-[10px] font-medium border rounded-full px-2 py-0.5"
                    style={{ color: '#f65555', borderColor: '#f6555533' }}
                  >
                    Premium
                  </span>
                  {hasAccess ? (
                    <span className="ml-auto text-xs font-semibold text-zinc-400 cursor-default">
                      Masz dostęp ✓
                    </span>
                  ) : (
                    <Link
                      href={`/kierunki/${slug}`}
                      className="ml-auto text-xs font-semibold transition-colors"
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