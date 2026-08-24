import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/server/user'
import { getUserEnrolledCourses, getProceduresCount } from '@/server/queries'
import ProceduresHub from '@/components/ProceduresHub'
import { Metadata } from 'next'

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = {
  title: 'Procedury',
  description: 'Procedury medyczne dostępne w ramach Twoich kursów',
}

export default async function ProceduresHubPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/')

  const courses = await getUserEnrolledCourses(user.userId)
  const hasOpiekun = courses.some((c) => c.slug === 'opiekun-medyczny')
  const hasPielegniarstwo = courses.some((c) => c.slug === 'pielegniarstwo')

  const [opiekunCount, pielegniastwoCount] = await Promise.all([
    hasOpiekun ? getProceduresCount('opiekun-medyczny') : Promise.resolve(0),
    hasPielegniarstwo ? getProceduresCount('pielegniarstwo') : Promise.resolve(0),
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
