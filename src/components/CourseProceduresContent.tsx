import { redirect } from 'next/navigation'
import ProceduresBrowser from '@/components/ProceduresBrowser'
import { toProcedureBrowseItems } from '@/helpers/toProcedureBrowseItems'
import { getAllProcedures, getUserEnrolledCourses } from '@/server/queries'
import { getCurrentUser } from '@/server/user'
import type { CourseProceduresPageProps } from '@/types/procedureBrowseTypes'

export default async function CourseProceduresContent({ params }: CourseProceduresPageProps) {
  const { course } = await params
  if (course !== 'opiekun-medyczny' && course !== 'pielegniarstwo') {
    redirect('/panel/procedury')
  }

  const user = await getCurrentUser()
  if (!user) redirect('/')

  const courses = await getUserEnrolledCourses(user.userId)
  if (!courses.some((item) => item.slug === course)) redirect('/panel/procedury')

  const rows = await getAllProcedures(course)
  return <ProceduresBrowser course={course} procedures={toProcedureBrowseItems(rows, course)} />
}
