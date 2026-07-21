'use client'

import { ChevronDown, ChevronRight } from 'lucide-react'
import { scaledConceptMinutes } from '@/helpers/scaledConceptMinutes'
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
  const expandable = entry.topicGroups.length > 0
  return (
    <div className="border border-zinc-200 rounded-lg">
      <div className="flex items-center justify-between px-3 py-2.5">
        <button
          type="button"
          onClick={() => wizard.setExpandedCategory(expanded ? null : entry.categoryKey)}
          disabled={!expandable}
          className="text-left flex-1 flex items-center gap-2 disabled:cursor-default"
        >
          {expandable && (
            <span className="shrink-0 text-zinc-400">
              {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </span>
          )}
          <span className="min-w-0">
            <span className="block text-sm font-medium text-zinc-800">{entry.label}</span>
            {entry.questionCount > 0 && (
              <span className="block text-xs text-zinc-400">
                {entry.questionCount} pytań w bazie testów
              </span>
            )}
            {expandable && (
              <span className="block text-xs text-[#ff9898]">
                {expanded ? 'Zwiń tematy' : 'Rozwiń tematy programu'}
              </span>
            )}
          </span>
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
                targetMinutes: scaledConceptMinutes(entry),
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
