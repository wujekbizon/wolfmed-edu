import { Suspense } from 'react'
import { Metadata } from 'next'
import PracticalExamsContent from '@/components/PracticalExamsContent'
import PracticalExamListSkeleton from '@/components/skeletons/PracticalExamListSkeleton'

export const metadata: Metadata = {
  title: 'Egzamin praktyczny — Opiekun medyczny',
  description: 'Wierne arkusze egzaminacyjne MED.14 części praktycznej. Wypełnij dokumentację i sprawdź się przed egzaminem.',
}

export const dynamic = 'force-dynamic'

export default function PracticalExamsPage() {
  return (
    <div className='h-full w-full min-w-0'>
      <Suspense fallback={<PracticalExamListSkeleton />}>
        <PracticalExamsContent />
      </Suspense>
    </div>
  )
}
