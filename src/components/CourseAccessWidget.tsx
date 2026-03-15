import Link from 'next/link'
import { careerPathsData } from '@/constants/careerPathsData'
import { getUserEnrollmentsAction } from '@/actions/course-actions'

const TIER_LABELS: Record<string, string> = {
  free: 'Free',
  basic: 'Basic',
  premium: 'Premium',
  pro: 'Pro',
}

type Enrollments = Awaited<ReturnType<typeof getUserEnrollmentsAction>>['enrollments']

interface CourseAccessWidgetProps {
  enrollments: Enrollments
}

export default function CourseAccessWidget({ enrollments }: CourseAccessWidgetProps) {
  const activeEnrollments = enrollments.filter((e) => e.isActive)

  if (activeEnrollments.length > 0) {
    return (
      <div className="rounded-2xl p-5 border border-white/[0.06] bg-zinc-800">
        <h3 className="text-base font-semibold text-zinc-100 mb-3">
          Twoje kursy
        </h3>
        <div className="space-y-2">
          {activeEnrollments.map((enrollment) => {
            const course = careerPathsData[enrollment.courseSlug]
            return (
              <div
                key={enrollment.courseSlug}
                className="flex items-center justify-between gap-3 bg-zinc-700/60 border border-white/[0.06] rounded-xl px-4 py-2.5"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-100 truncate">
                    {course?.title ?? enrollment.courseSlug}
                  </p>
                  <span className="text-xs text-rose-400 font-medium">
                    {TIER_LABELS[enrollment.accessTier] ?? enrollment.accessTier}
                  </span>
                </div>
                <Link
                  href="/panel/kursy"
                  className="shrink-0 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
                >
                  Kontynuuj →
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl p-5 border border-white/[0.06] bg-zinc-800">
      <h3 className="text-base font-semibold text-zinc-100 mb-1">
        Zacznij swoją naukę
      </h3>
      <p className="text-xs text-zinc-400 mb-3">
        Wybierz kierunek i kup dostęp
      </p>
      <div className="space-y-2">
        {Object.entries(careerPathsData).map(([slug, path]) => (
          <div
            key={slug}
            className="flex items-center justify-between gap-3 bg-zinc-700/60 border border-white/[0.06] rounded-xl px-4 py-2.5"
          >
            <p className="text-sm font-medium text-zinc-200 truncate">
              {path.title}
            </p>
            <Link
              href={`/kierunki/${slug}`}
              className="shrink-0 text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors"
            >
              Kup dostęp →
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
