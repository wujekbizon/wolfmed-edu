'use client'

import { CONCEPT_DEFAULT_MINUTES } from '@/constants/planner'
import ConceptTopicRow from './ConceptTopicRow'
import type { ConceptCatalogEntry } from '@/types/plannerTypes'
import type { PlanWizardController } from '@/hooks/usePlanWizard'

export default function CatalogEntry({
  entry,
  wizard,
}: {
  entry: ConceptCatalogEntry
  wizard: PlanWizardController
}) {
  const expanded = wizard.expandedCategory === entry.categoryKey
  return (
    <div className="border border-zinc-200 rounded-lg">
      <div className="flex items-center justify-between px-3 py-2.5">
        <button
          type="button"
          onClick={() => wizard.setExpandedCategory(expanded ? null : entry.categoryKey)}
          className="text-left flex-1"
        >
          <span className="text-sm font-medium text-zinc-800">{entry.label}</span>
          {entry.questionCount > 0 && (
            <span className="block text-xs text-zinc-400">
              {entry.questionCount} pytań w bazie testów
            </span>
          )}
        </button>
        {wizard.hasConcept(entry.label) ? (
          <button
            type="button"
            onClick={() => wizard.removeConcept(entry.label)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100"
          >
            Usuń
          </button>
        ) : (
          <button
            type="button"
            onClick={() =>
              wizard.addConcept({
                categoryKey: entry.categoryKey,
                label: entry.label,
                source: 'category',
                targetMinutes: CONCEPT_DEFAULT_MINUTES,
              })
            }
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-700"
          >
            Dodaj
          </button>
        )}
      </div>
      {expanded && entry.topicGroups.length > 0 && (
        <div className="border-t border-zinc-200 px-3 py-2 space-y-3">
          {entry.topicGroups.map((group) => (
            <div key={group.key}>
              <span className="block text-xs font-semibold text-zinc-500 mb-1">{group.label}</span>
              <ul className="space-y-1">
                {group.topics.map((topic) => (
                  <ConceptTopicRow key={topic} categoryKey={entry.categoryKey} topic={topic} wizard={wizard} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
