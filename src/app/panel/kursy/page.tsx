import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import { getCurrentUser } from '@/server/user'
import { getUserEnrolledCourses } from '@/server/queries'
import { CATEGORY_METADATA } from '@/constants/categoryMetadata'
import EnrolledCoursesListSkeleton from '@/components/skeletons/EnrolledCoursesListSkeleton'
import EnrolledCoursesList from '@/components/EnrolledCoursesList'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const categories = Object.entries(CATEGORY_METADATA)
  const categoryKeys = categories
    .filter(([_, meta]) => meta.course)
    .map(([key]) => key)
    .join(', ')

  return {
    title: 'Moje Kursy - Zarządzaj swoimi szkoleniami',
    description: `Przeglądaj kursy, do których jesteś zapisany. Dostępne kategorie: ${categoryKeys}`,
    keywords: 'kursy, szkolenia, opiekun medyczny, pielęgniarstwo, moje kursy',
  }
}

async function EnrolledCourses() {
  const user = await getCurrentUser()
  if (!user) redirect('/sign-in')

  const enrolledCourses = await getUserEnrolledCourses(user.userId)

  return <EnrolledCoursesList courses={enrolledCourses} />
}

export default function KursyPage() {
  return (
    <section className="w-full h-full overflow-y-auto scrollbar-webkit p-4 lg:p-16">
      <Suspense fallback={<EnrolledCoursesListSkeleton />}>
        <EnrolledCourses />
      </Suspense>
    </section>
  )
}