'use client'

import { useActionState } from 'react'
import { logStudySessionAction } from '@/actions/planner'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { useToastMessage } from '@/hooks/useToastMessage'
import Input from '@/components/ui/Input'
import FieldError from '@/components/FieldError'
import SubmitButton from '@/components/SubmitButton'
import type { ConceptProgress } from '@/types/plannerTypes'

const FIELD_CLASS =
  'px-4 py-2 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff9898]/50 focus:border-transparent transition-shadow'

export default function QuickStudyLogForm({ concepts }: { concepts: ConceptProgress[] }) {
  const [formState, action] = useActionState(logStudySessionAction, EMPTY_FORM_STATE)
  const noScriptFallback = useToastMessage(formState)

  const openConcepts = concepts.filter((concept) => !concept.completedAt)

  return (
    <form action={action} className="flex flex-col gap-2">
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
        <Input
          type="number"
          name="minutes"
          required
          min={1}
          max={600}
          placeholder="Minuty"
          ariaLabel="Liczba minut nauki"
          className={`w-full sm:w-28 ${FIELD_CLASS}`}
        />
        {openConcepts.length > 0 && (
          <select
            name="conceptId"
            defaultValue=""
            className={`w-full sm:flex-1 sm:min-w-0 sm:max-w-xs text-zinc-600 truncate ${FIELD_CLASS}`}
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
        <Input
          type="text"
          name="note"
          maxLength={500}
          placeholder="Notatka (opcjonalnie)"
          className={`w-full sm:flex-1 sm:min-w-40 ${FIELD_CLASS}`}
        />
        <div className="w-full sm:w-auto">
          <SubmitButton label="Zapisz" loading="Zapisywanie…" className="sm:w-auto sm:px-5" />
        </div>
      </div>
      <FieldError name="minutes" formState={formState} />
      {noScriptFallback}
    </form>
  )
}
