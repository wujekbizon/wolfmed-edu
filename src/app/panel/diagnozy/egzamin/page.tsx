import { Suspense } from 'react'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/server/user'
import { hasDiagnozyAccess } from '@/helpers/hasDiagnozyAccess'
import { getDiagnozyTitlesBySlugs, getUserDiagnozyExamAttempts } from '@/server/queries'
import { getDiagnozyTitlesBySlug } from '@/helpers/getDiagnozyTitlesBySlug'
import EgzaminRunner from '@/components/diagnozy/egzamin/EgzaminRunner'
import EgzaminHeader from '@/components/diagnozy/egzamin/EgzaminHeader'
import EgzaminAttemptsList from '@/components/diagnozy/egzamin/EgzaminAttemptsList'
import EgzaminAttemptsListSkeleton from '@/components/skeletons/EgzaminAttemptsListSkeleton'
import EgzaminContentSkeleton from '@/components/skeletons/EgzaminContentSkeleton'
import NoAccessMessage from '@/components/NoAccessMessage'

export const metadata: Metadata = {
  title: 'Egzamin — Diagnozy i Interwencje',
  description:
    'Egzamin próbny z procesu pielęgnowania: wylosowany przypadek, wypełnienie przewodnika, ocena odpowiedzi',
}

export const dynamic = 'force-dynamic'

async function EgzaminAttempts({ userId }: { userId: string }) {
  const attempts = await getUserDiagnozyExamAttempts(userId)
  const titleRows = await getDiagnozyTitlesBySlugs(attempts.map((a) => a.diagnozaSlug))

  return (
    <EgzaminAttemptsList
      attempts={attempts}
      titlesBySlug={getDiagnozyTitlesBySlug(titleRows)}
    />
  )
}

async function EgzaminContent() {
  const user = await getCurrentUser()
  if (!user) redirect('/sign-in')

  const hasAccess = await hasDiagnozyAccess()
  if (!hasAccess) return <NoAccessMessage />

  return (
    <>
      <EgzaminHeader />
      <EgzaminRunner />
      <Suspense fallback={<EgzaminAttemptsListSkeleton />}>
        <EgzaminAttempts userId={user.userId} />
      </Suspense>
    </>
  )
}

export default function DiagnozyEgzaminPage() {
  return (
    <section className="w-full h-full overflow-y-auto scrollbar-webkit p-4 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <Suspense fallback={<EgzaminContentSkeleton />}>
          <EgzaminContent />
        </Suspense>
      </div>
    </section>
  )
}
