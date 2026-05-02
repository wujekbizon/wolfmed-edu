import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/server/user'
import { getUserEnrolledCourses } from '@/server/queries'
import ProceduresHub from '@/components/ProceduresHub'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Procedury',
  description: 'Procedury medyczne dostępne w ramach Twoich kursów',
}

export default async function ProceduresHubPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/sign-in')

  const courses = await getUserEnrolledCourses(user.id)
  const hasOpiekun = courses.some((c) => c.slug === 'opiekun-medyczny')
  const hasPielegniarstwo = courses.some((c) => c.slug === 'pielegniarstwo')

  return <ProceduresHub hasOpiekun={hasOpiekun} hasPielegniarstwo={hasPielegniarstwo} />
}
