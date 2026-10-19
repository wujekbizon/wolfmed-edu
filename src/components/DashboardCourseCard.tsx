import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { DashboardCourseProps } from '@/types/dashboardDiscoveryTypes'

export default function DashboardCourseCard({ course, hasAccess, loading }: DashboardCourseProps) {
  return (
    <div className="flex flex-col gap-3 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="min-w-0">
        <h4 className="text-sm font-semibold text-zinc-900">{course.title}</h4>
        <p className="mt-1 text-xs leading-5 text-zinc-600">{course.description}</p>
        <p className="mt-1.5 text-[11px] leading-5 text-zinc-500">{course.subjects}</p>
      </div>
      {loading ? <div className="h-4 w-28 shrink-0 animate-pulse rounded bg-zinc-200/60" /> : (
        <Link
          href={hasAccess ? '/panel/nauka' : `/kierunki/${course.slug}`}
          className="flex shrink-0 items-center gap-1.5 self-start rounded text-xs font-semibold text-[#806796] hover:text-[#6c587b] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a18abf] sm:self-center"
        >
          {hasAccess ? 'Przejdź do nauki' : 'Poznaj kierunek'}
          <ArrowRight aria-hidden="true" className="size-3.5" />
        </Link>
      )}
    </div>
  )
}
