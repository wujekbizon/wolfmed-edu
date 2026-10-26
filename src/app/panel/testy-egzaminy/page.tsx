import { Suspense } from 'react'
import { Metadata } from 'next'
import TestyEgzaminyContent from '@/components/TestyEgzaminyContent'
import ExamHubSkeleton from '@/components/skeletons/ExamHubSkeleton'

export const metadata: Metadata = {
  title: 'Testy i egzaminy',
  description: 'Wybierz egzamin teoretyczny lub praktyczny i sprawdź swoją wiedzę',
}

export const dynamic = 'force-dynamic'

export default function TestyEgzaminyPage() {
  return (
    <Suspense fallback={<ExamHubSkeleton />}>
      <TestyEgzaminyContent />
    </Suspense>
  )
}
