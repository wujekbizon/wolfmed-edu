import { Suspense } from 'react'
import { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import { getCurrentUser } from '@/server/user'
import { hasDiagnozyAccess } from '@/helpers/hasDiagnozyAccess'
import {
  getDiagnozaBySlug,
  getDiagnozaFormulations,
  getUserDiagnozyCompletions,
} from '@/server/queries'
import DiagnozaTabs from '@/components/diagnozy/DiagnozaTabs'
import DiagnozaHeader from '@/components/diagnozy/DiagnozaHeader'
import DiagnozaStudyView from '@/components/diagnozy/DiagnozaStudyView'
import WypelnijRunner from '@/components/diagnozy/wypelnij/WypelnijRunner'
import DiagnozaContentSkeleton from '@/components/skeletons/DiagnozaContentSkeleton'
import WypelnijRunnerSkeleton from '@/components/skeletons/WypelnijRunnerSkeleton'
import NoAccessMessage from '@/components/NoAccessMessage'
import type { Diagnoza } from '@/types/diagnozyTypes'

interface Props {
  params: Promise<{ slug: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const diagnoza = await getDiagnozaBySlug(slug)
  return {
    title: diagnoza ? `${diagnoza.section} ${diagnoza.title}` : 'Diagnozy i Interwencje',
  }
}

async function WypelnijPanel({ diagnoza, userId }: { diagnoza: Diagnoza; userId: string }) {
  const [formulations, completedSlugs] = await Promise.all([
    getDiagnozaFormulations(),
    getUserDiagnozyCompletions(userId),
  ])

  return (
    <WypelnijRunner
      diagnoza={diagnoza}
      formulations={formulations}
      alreadyCompleted={completedSlugs.includes(diagnoza.slug)}
    />
  )
}

async function DiagnozaContent({ params }: Props) {
  const user = await getCurrentUser()
  if (!user) redirect('/sign-in')

  const hasAccess = await hasDiagnozyAccess()
  if (!hasAccess) return <NoAccessMessage />

  const { slug } = await params
  const diagnoza = await getDiagnozaBySlug(slug)
  if (!diagnoza) notFound()

  return (
    <>
      <DiagnozaHeader diagnoza={diagnoza} />
      <DiagnozaTabs
        nauka={<DiagnozaStudyView diagnoza={diagnoza} />}
        wypelnij={
          <Suspense fallback={<WypelnijRunnerSkeleton />}>
            <WypelnijPanel diagnoza={diagnoza} userId={user.userId} />
          </Suspense>
        }
      />
    </>
  )
}

export default function DiagnozaPage({ params }: Props) {
  return (
    <section className="w-full h-full overflow-y-auto scrollbar-webkit p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Suspense fallback={<DiagnozaContentSkeleton />}>
          <DiagnozaContent params={params} />
        </Suspense>
      </div>
    </section>
  )
}
