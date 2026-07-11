'use client'

import { useActionState } from 'react'
import { logStudySessionAction } from '@/actions/planner'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { useToastMessage } from '@/hooks/useToastMessage'
import type { ConceptProgress } from '@/types/plannerTypes'

export default function QuickStudyLogForm({
  concepts,
}: {
  concepts: ConceptProgress[]
}) {
  const [formState, action, isPending] = useActionState(
    logStudySessionAction,
    EMPTY_FORM_STATE
  )
  const noScriptFallback = useToastMessage(formState)

  const openConcepts = concepts.filter((concept) => !concept.completedAt)

  return (
    <form action={action} className="flex flex-wrap gap-2">
      {noScriptFallback}
      <input
        type="number"
        name="minutes"
        required
        min={1}
        max={600}
        placeholder="Minuty"
        className="w-28 px-4 py-2 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:border-zinc-400"
        aria-label="Liczba minut nauki"
      />
      {openConcepts.length > 0 && (
        <select
          name="conceptId"
          defaultValue=""
          className="px-3 py-2 rounded-lg border border-zinc-200 text-sm text-zinc-600 focus:outline-none focus:border-zinc-400"
          aria-label="Zagadnienie (opcjonalnie)"
        >
          <option value="">Bez zagadnienia</option>
          {openConcepts.map((concept) => (
            <option key={concept.id} value={concept.id}>
              {concept.label}
            </option>
          ))}
        </select>
      )}
      <input
        type="text"
        name="note"
        maxLength={500}
        placeholder="Notatka (opcjonalnie)"
        className="flex-1 min-w-40 px-4 py-2 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:border-zinc-400"
      />
      <button
        type="submit"
        disabled={isPending}
        className="px-5 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-40"
      >
        {isPending ? 'Zapisywanie…' : 'Zapisz'}
      </button>
    </form>
  )
}
