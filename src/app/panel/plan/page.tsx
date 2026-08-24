import { redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import { getProcedureOptions, getUserEnrolledCourses } from '@/server/queries'
import { getPlanProgress } from '@/server/planner/progress'
import { getConceptCatalog, getExamDatePresets } from '@/server/planner/catalog'
import PlanWizard from '@/components/planner/PlanWizard'
import PlanDashboard from '@/components/planner/PlanDashboard'
import type {
  ConceptCatalogEntry,
  ExamDatePreset,
  ProcedureOption,
} from '@/types/plannerTypes'

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata = {
  title: 'Plan Nauki | Wolfmed',
  description:
    'Zaplanuj swoją naukę: ustal cel, czas i zakres, a Wolfmed pomoże Ci go zrealizować.',
}

export default async function PlanPage({
  searchParams,
}: {
  searchParams: Promise<{ zakres?: string }>
}) {
  const user = await currentUser()
  if (!user) redirect('/')

  const progress = await getPlanProgress(user.id)

  if (progress) {
    return (
      <div className="container mx-auto px-3 xs:px-4 sm:px-8">
        <PlanDashboard progress={progress} />
      </div>
    )
  }

  const enrolledCourses = await getUserEnrolledCourses(user.id)
  const [catalogs, procedureLists] = await Promise.all([
    Promise.all(enrolledCourses.map((course) => getConceptCatalog(course.slug))),
    Promise.all(enrolledCourses.map((course) => getProcedureOptions(course.slug))),
  ])
  const catalogByCourse: Record<string, ConceptCatalogEntry[]> = {}
  const examPresetsByCourse: Record<string, ExamDatePreset[]> = {}
  const proceduresByCourse: Record<string, ProcedureOption[]> = {}
  enrolledCourses.forEach((course, index) => {
    catalogByCourse[course.slug] = catalogs[index] ?? []
    examPresetsByCourse[course.slug] = getExamDatePresets(course.slug)
    proceduresByCourse[course.slug] = procedureLists[index] ?? []
  })

  const { zakres } = await searchParams

  return (
    <div className="container mx-auto px-3 xs:px-4 sm:px-8">
      <PlanWizard
        courses={enrolledCourses.map((course) => ({
          slug: course.slug,
          name: course.name,
        }))}
        catalogByCourse={catalogByCourse}
        examPresetsByCourse={examPresetsByCourse}
        proceduresByCourse={proceduresByCourse}
        initialFocus={zakres ?? null}
      />
    </div>
  )
}
