import type { ConceptProgress } from '@/types/plannerTypes'
import type { SelectOption } from '@/types/uiTypes'

export function getConceptSelectOptions(concepts: ConceptProgress[]): SelectOption[] {
  return [
    { value: '', label: 'Bez zagadnienia' },
    ...concepts.map((concept) => ({ value: concept.id, label: concept.label })),
  ]
}
