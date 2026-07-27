import { Suspense } from 'react'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/server/user'
import { hasDiagnozyAccess } from '@/helpers/hasDiagnozyAccess'
import { getAllDiagnozy, getUserDiagnozyCompletions } from '@/server/queries'
import DiagnozyBrowser from '@/components/diagnozy/browse/DiagnozyBrowser'
import DiagnozyHeader from '@/components/diagnozy/browse/DiagnozyHeader'
import DiagnozyEmptyState from '@/components/diagnozy/browse/DiagnozyEmptyState'
import DiagnozyBrowserSkeleton from '@/components/skeletons/DiagnozyBrowserSkeleton'
import NoAccessMessage from '@/components/NoAccessMessage'

export const metadata: Metadata = {
  title: 'Diagnozy i Interwencje',
  description:
    'Diagnozy pielęgniarskie z interwencjami — nauka i wypełnianie procesu pielęgnowania',
}

export const dynamic = 'force-dynamic'

async function DiagnozyContent() {
  const user = await getCurrentUser()
  if (!user) redirect('/sign-in')

  const hasAccess = await hasDiagnozyAccess()
  if (!hasAccess) return <NoAccessMessage />

  const [diagnozy, completedSlugs] = await Promise.all([
    getAllDiagnozy(),
    getUserDiagnozyCompletions(user.userId),
  ])

  return (
    <>
      <DiagnozyHeader />
      {diagnozy.length === 0 ? (
        <DiagnozyEmptyState />
      ) : (
        <DiagnozyBrowser diagnozy={diagnozy} completedSlugs={completedSlugs} />
      )}
    </>
  )
}

export default function DiagnozyPage() {
  return (
    <section className="w-full h-full overflow-y-auto scrollbar-webkit p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <Suspense fallback={<DiagnozyBrowserSkeleton />}>
          <DiagnozyContent />
        </Suspense>
      </div>
    </section>
  )
}
