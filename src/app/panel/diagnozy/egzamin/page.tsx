import { Suspense } from 'react'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/server/user'
import { hasDiagnozyAccess } from '@/helpers/hasDiagnozyAccess'
import { getDiagnozyTitlesBySlugs, getUserDiagnozyExamAttempts } from '@/server/queries'
import { getDiagnozyTitlesBySlug } from '@/helpers/getDiagnozyTitlesBySlug'
import { ATTEMPTS_HISTORY_LIMIT } from '@/constants/examAttempts'
import EgzaminRunner from '@/components/diagnozy/egzamin/EgzaminRunner'
import EgzaminHeader from '@/components/diagnozy/egzamin/EgzaminHeader'
import EgzaminAttemptsPanel from '@/components/diagnozy/egzamin/EgzaminAttemptsPanel'
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
  const attempts = await getUserDiagnozyExamAttempts(userId, ATTEMPTS_HISTORY_LIMIT)
  const titleRows = await getDiagnozyTitlesBySlugs(attempts.map((a) => a.diagnozaSlug))

  return (
    <EgzaminAttemptsPanel
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
    <section className="w-full bg-slate-50 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <Suspense fallback={<EgzaminContentSkeleton />}>
          <EgzaminContent />
        </Suspense>
      </div>
    </section>
  )
}
