import 'server-only'

import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/server/user'
import { getUserEnrolledCourses } from '@/server/queries'
import { getProcedureHubCards } from '@/helpers/getProcedureHubCards'
import ProceduresHub from '@/components/ProceduresHub'

export default async function ProceduresHubContent() {
  const user = await getCurrentUser()
  if (!user) redirect('/')

  const courses = await getUserEnrolledCourses(user.userId)
  return <ProceduresHub cards={getProcedureHubCards(courses)} />
}
