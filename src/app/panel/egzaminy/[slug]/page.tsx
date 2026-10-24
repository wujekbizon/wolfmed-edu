import { Suspense } from 'react'
import { Metadata } from 'next'
import { getPublicPracticalExamById } from '@/lib/praktycznyUtils'
import PracticalExamContent from '@/components/PracticalExamContent'
import PracticalBriefSkeleton from '@/components/skeletons/PracticalBriefSkeleton'
import type { PracticalExamRouteProps } from '@/types/practicalExamRouteTypes'

export async function generateMetadata({ params }: PracticalExamRouteProps): Promise<Metadata> {
  const { slug } = await params
  const exam = getPublicPracticalExamById(slug)
  return {
    title: exam ? exam.title : 'Egzamin praktyczny',
    description: exam ? `Arkusz ${exam.arkusz} — część praktyczna MED.14` : undefined,
  }
}

export const dynamic = 'force-dynamic'

export default function PracticalExamPage({ params }: PracticalExamRouteProps) {
  return (
    <Suspense fallback={<PracticalBriefSkeleton />}>
      <PracticalExamContent params={params} />
    </Suspense>
  )
}
