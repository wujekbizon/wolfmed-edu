'use client'

import { TOPIC_DEFAULT_MINUTES } from '@/constants/planner'
import type { PlanWizardController } from '@/hooks/usePlanWizard'

export default function ConceptTopicRow({
  categoryKey,
  topic,
  wizard,
}: {
  categoryKey: string
  topic: string
  wizard: PlanWizardController
}) {
  const label = topic.slice(0, 255)
  return (
    <li className="flex items-center justify-between gap-2 py-0.5">
      <span className="text-xs text-zinc-600">{topic}</span>
      {wizard.hasConcept(label) ? (
        <button
          type="button"
          onClick={() => wizard.removeConcept(label)}
          className="text-xs text-red-500 font-semibold shrink-0"
        >
          Usuń
        </button>
      ) : (
        <button
          type="button"
          onClick={() =>
            wizard.addConcept({ categoryKey, label, source: 'category', targetMinutes: TOPIC_DEFAULT_MINUTES })
          }
          className="text-xs text-zinc-700 font-semibold shrink-0 hover:text-red-500"
        >
          + Dodaj
        </button>
      )}
    </li>
  )
}
