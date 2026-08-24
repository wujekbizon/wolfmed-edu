import { redirect } from 'next/navigation'
import AllProcedures from '@/components/AllProcedures'
import PielegniastwoProceduresList from '@/components/PielegniastwoProceduresList'
import { getAllProcedures, getUserEnrolledCourses } from '@/server/queries'
import { getCurrentUser } from '@/server/user'
import type { Procedure } from '@/types/dataTypes'
import type { PielegniastwoProcedure } from '@/types/pielegniastwoTypes'

export default async function CourseProceduresContent({ course }: { course: string }) {
  const user = await getCurrentUser()
  if (!user) redirect('/')

  const courses = await getUserEnrolledCourses(user.userId)
  if (!courses.some((item) => item.slug === course)) redirect('/panel/procedury')

  const rows = await getAllProcedures(course)

  if (course === 'opiekun-medyczny') {
    return <AllProcedures procedures={rows as unknown as Procedure[]} />
  }

  if (course === 'pielegniarstwo') {
    const procedures = rows.map((row) => row.data as PielegniastwoProcedure)
    return <PielegniastwoProceduresList procedures={procedures} />
  }

  redirect('/panel/procedury')
}
