import { Suspense } from 'react'
import type { Metadata } from 'next'
import ProceduresHubContent from '@/components/ProceduresHubContent'
import ProceduresHubSkeleton from '@/components/skeletons/ProceduresHubSkeleton'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Procedury',
  description: 'Procedury medyczne dostępne w ramach Twoich kursów',
}

export default function ProceduresHubPage() {
  return (
    <Suspense fallback={<ProceduresHubSkeleton />}>
      <ProceduresHubContent />
    </Suspense>
  )
}
