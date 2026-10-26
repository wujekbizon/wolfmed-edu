import { Suspense } from 'react'
import ProceduresHubLayout from '@/components/ProceduresHubLayout'
import ProcedureHubCard from '@/components/ProcedureHubCard'
import ProcedureHubCardSkeleton from '@/components/skeletons/ProcedureHubCardSkeleton'
import type { ProceduresHubProps } from '@/types/procedureHubTypes'

export default function ProceduresHub({ cards }: ProceduresHubProps) {
  return (
    <ProceduresHubLayout panels={cards.map(card => ({
      id: card.slug,
      label: card.title,
      content: (
        <Suspense fallback={<ProcedureHubCardSkeleton />}>
          <ProcedureHubCard card={card} />
        </Suspense>
      ),
    }))} />
  )
}
