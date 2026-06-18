import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/server/user'
import { getUserEnrolledCourses, getProceduresCount } from '@/server/queries'
import { getAllPielegniastwoProcedures } from '@/lib/pielegniastwoUtils'
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

  const courses = await getUserEnrolledCourses(user.userId)
  const hasOpiekun = courses.some((c) => c.slug === 'opiekun-medyczny')
  const hasPielegniarstwo = courses.some((c) => c.slug === 'pielegniarstwo')

  const [opiekunCount, pielegniastwoCount] = await Promise.all([
    hasOpiekun ? getProceduresCount() : Promise.resolve(0),
    Promise.resolve(hasPielegniarstwo ? getAllPielegniastwoProcedures().length : 0),
  ])

  const procedureCounts: Record<string, number> = {
    'opiekun-medyczny': opiekunCount,
    pielegniarstwo: pielegniastwoCount,
  }

  return (
    <ProceduresHub
      hasOpiekun={hasOpiekun}
      hasPielegniarstwo={hasPielegniarstwo}
      procedureCounts={procedureCounts}
    />
  )
}
