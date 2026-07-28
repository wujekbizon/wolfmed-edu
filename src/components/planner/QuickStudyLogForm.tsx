'use client'

import { useActionState, useState } from 'react'
import { logStudySessionAction } from '@/actions/planner'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { useToastMessage } from '@/hooks/useToastMessage'
import { getConceptSelectOptions } from '@/helpers/getConceptSelectOptions'
import Input from '@/components/ui/Input'
import DropdownSelect from '@/components/ui/DropdownSelect'
import FieldError from '@/components/FieldError'
import SubmitButton from '@/components/SubmitButton'
import type { ConceptProgress } from '@/types/plannerTypes'

// Matches DropdownSelect's trigger so the row reads as one set of controls.
const FIELD_CLASS =
  'px-3 py-2 rounded-xl border border-zinc-300 bg-white text-sm focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-colors'

export default function QuickStudyLogForm({ concepts }: { concepts: ConceptProgress[] }) {
  const [formState, action] = useActionState(logStudySessionAction, EMPTY_FORM_STATE)
  const noScriptFallback = useToastMessage(formState)
  const [conceptId, setConceptId] = useState('')

  const openConcepts = concepts.filter((concept) => !concept.completedAt)

  return (
    <form action={action} className="flex flex-col gap-2">
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
        <Input
          type="number"
          name="minutes"
          placeholder="Minuty"
          ariaLabel="Liczba minut nauki"
          className={`w-full sm:w-28 ${FIELD_CLASS}`}
        />
        {openConcepts.length > 0 && (
          <DropdownSelect
            options={getConceptSelectOptions(openConcepts)}
            value={conceptId}
            onSelect={setConceptId}
            name="conceptId"
            ariaLabel="Zagadnienie (opcjonalnie)"
            placeholder="Bez zagadnienia"
            className="w-full sm:flex-1 sm:min-w-0 sm:max-w-xs"
          />
        )}
        <Input
          type="text"
          name="note"
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
