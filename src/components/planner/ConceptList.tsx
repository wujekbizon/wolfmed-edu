import ConceptRow from './dashboard/ConceptRow'
import AddConceptForm from './dashboard/AddConceptForm'
import type { ConceptProgress } from '@/types/plannerTypes'

export default function ConceptList({
  planId,
  concepts,
}: {
  planId: string
  concepts: ConceptProgress[]
}) {
  return (
    <div>
      {concepts.length === 0 ? (
        <p className="text-sm text-zinc-500">Brak zagadnień w planie — dodaj pierwsze poniżej.</p>
      ) : (
        <ul className="space-y-2">
          {concepts.map((concept) => (
            <ConceptRow key={concept.id} concept={concept} />
          ))}
        </ul>
      )}
      <AddConceptForm planId={planId} />
    </div>
  )
}
