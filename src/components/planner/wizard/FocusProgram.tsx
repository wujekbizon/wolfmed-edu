'use client'

import { BookOpen, ChevronRight, ChevronDown } from 'lucide-react'
import CatalogEntry from './CatalogEntry'
import FocusTopicGroup from './FocusTopicGroup'
import type { ConceptCatalogEntry } from '@/types/plannerTypes'
import type { PlanWizardController } from '@/hooks/usePlanWizard'

export default function FocusProgram({
  focusEntry,
  wizard,
}: {
  focusEntry: ConceptCatalogEntry
  wizard: PlanWizardController
}) {
  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-zinc-700">
            <BookOpen className="w-4 h-4 text-[#ff9898]" />
            Program: {focusEntry.label}
          </h3>
          {focusEntry.questionCount > 0 && (
            <span className="text-xs text-zinc-400">{focusEntry.questionCount} pytań w bazie testów</span>
          )}
        </div>
        <p className="text-xs text-zinc-400 mb-3">
          Zagadnienia pochodzą prosto z programu przedmiotu — dodaj całe sekcje albo wybierz pojedyncze tematy.
        </p>
        <div className="space-y-4 max-h-96 overflow-y-auto pr-1 border border-zinc-200 rounded-lg p-3">
          {focusEntry.topicGroups.length === 0 && (
            <p className="text-sm text-zinc-400">
              Ten przedmiot nie ma jeszcze szczegółowego programu. Dodaj go jako jedno zagadnienie lub dopisz
              własne tematy poniżej.
            </p>
          )}
          {focusEntry.topicGroups.map((group) => (
            <FocusTopicGroup key={group.key} categoryKey={focusEntry.categoryKey} group={group} wizard={wizard} />
          ))}
        </div>
      </div>

      {wizard.otherEntries.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => wizard.setShowOtherSubjects((show) => !show)}
            className="inline-flex items-center gap-1 text-sm font-semibold text-zinc-500 hover:text-zinc-800"
          >
            {wizard.showOtherSubjects ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            Inne przedmioty ({wizard.otherEntries.length})
          </button>
          {wizard.showOtherSubjects && (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1 mt-2">
              {wizard.otherEntries.map((entry) => (
                <CatalogEntry key={entry.categoryKey} entry={entry} wizard={wizard} />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
