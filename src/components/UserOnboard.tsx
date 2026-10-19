import { DASHBOARD_COURSES, DASHBOARD_TOOLS } from '@/constants/dashboardDiscovery'
import { getDashboardAccess } from '@/helpers/getDashboardAccess'
import DashboardToolCard from '@/components/DashboardToolCard'
import DashboardCourseCard from '@/components/DashboardCourseCard'
import Card from '@/components/ui/Card'
import type { DashboardDiscoveryProps } from '@/types/dashboardDiscoveryTypes'

export default function UserOnboard({ enrollments, loading = false }: DashboardDiscoveryProps) {
  const { accessibleCourses, hasPremium, upgradeHref } = getDashboardAccess(enrollments)

  return (
    <div inert={loading || undefined} aria-busy={loading} className="flex h-full flex-col gap-7 rounded-2xl border border-zinc-100 bg-zinc-50/30 p-4 lg:p-6">
      <div>
        <h2 className="text-2xl font-bold leading-tight tracking-tight text-zinc-900 sm:text-3xl">Twoja nauka, Twoje tempo.</h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-600">
          Rozwiązuj testy, ćwicz procedury i korzystaj z narzędzi do nauki — wszystko w jednym miejscu.
        </p>
      </div>
      <section aria-labelledby="dashboard-tools-title">
        <h3 id="dashboard-tools-title" className="mb-3 text-xs font-semibold text-zinc-600">Narzędzia do nauki</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {DASHBOARD_TOOLS.map((tool) => (
            <DashboardToolCard key={tool.label} tool={tool} hasPremium={hasPremium} upgradeHref={upgradeHref} loading={loading} />
          ))}
        </div>
      </section>
      <section aria-labelledby="dashboard-courses-title">
        <h3 id="dashboard-courses-title" className="text-xs font-semibold text-zinc-600">Poznaj kierunki</h3>
        <p className="mt-1 mb-4 text-xs leading-5 text-zinc-500">Sprawdź zakres materiałów i dostępne plany.</p>
        <Card className="divide-y divide-zinc-100 p-4 sm:p-5">
          {DASHBOARD_COURSES.map((course) => (
            <DashboardCourseCard
              key={course.slug}
              course={course}
              hasAccess={accessibleCourses.has(course.slug)}
              loading={loading}
            />
          ))}
        </Card>
      </section>
    </div>
  )
}
