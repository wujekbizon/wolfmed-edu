'use client'

import { Check } from 'lucide-react'
import ConceptTopicRow from './ConceptTopicRow'
import type { ConceptTopicGroup } from '@/types/plannerTypes'
import type { PlanWizardController } from '@/hooks/usePlanWizard'

export default function FocusTopicGroup({
  categoryKey,
  group,
  wizard,
}: {
  categoryKey: string
  group: ConceptTopicGroup
  wizard: PlanWizardController
}) {
  const remaining = group.topics.filter((topic) => !wizard.hasConcept(topic.slice(0, 255)))

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-zinc-500">{group.label}</span>
        {remaining.length > 0 ? (
          <button
            type="button"
            onClick={() => wizard.addTopics(categoryKey, group.topics)}
            className="text-xs font-semibold text-red-500 hover:text-red-600"
          >
            Dodaj wszystkie ({remaining.length})
          </button>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-500">
            <Check className="w-3.5 h-3.5" strokeWidth={3} />
            dodano
          </span>
        )}
      </div>
      <ul className="space-y-1">
        {group.topics.map((topic) => (
          <ConceptTopicRow key={topic} categoryKey={categoryKey} topic={topic} wizard={wizard} />
        ))}
      </ul>
    </div>
  )
}
