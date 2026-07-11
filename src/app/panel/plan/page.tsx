import { redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import { getUserEnrolledCourses } from '@/server/queries'
import { getPlanProgress } from '@/server/planner/progress'
import { getConceptCatalog, getExamDatePresets } from '@/server/planner/catalog'
import PlanWizard from '@/components/planner/PlanWizard'
import PlanDashboard from '@/components/planner/PlanDashboard'
import type { ConceptCatalogEntry } from '@/types/plannerTypes'

export const metadata = {
  title: 'Plan Nauki | Wolfmed',
  description:
    'Zaplanuj swoją naukę: ustal cel, czas i zakres, a Wolfmed pomoże Ci go zrealizować.',
}

export default async function PlanPage() {
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
  const catalogs = await Promise.all(
    enrolledCourses.map((course) => getConceptCatalog(course.slug))
  )
  const catalogByCourse: Record<string, ConceptCatalogEntry[]> = {}
  enrolledCourses.forEach((course, index) => {
    catalogByCourse[course.slug] = catalogs[index] ?? []
  })

  return (
    <div className="container mx-auto px-3 xs:px-4 sm:px-8">
      <PlanWizard
        courses={enrolledCourses.map((course) => ({
          slug: course.slug,
          name: course.name,
        }))}
        catalogByCourse={catalogByCourse}
        examPresets={getExamDatePresets()}
      />
    </div>
  )
}
