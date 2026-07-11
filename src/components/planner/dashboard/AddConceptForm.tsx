'use client'

import { useActionState } from 'react'
import { addConceptAction } from '@/actions/planner'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { useToastMessage } from '@/hooks/useToastMessage'
import Input from '@/components/ui/Input'
import FieldError from '@/components/FieldError'
import SubmitButton from '@/components/SubmitButton'
import { CONCEPT_DEFAULT_MINUTES } from '@/constants/planner'

const FIELD_CLASS =
  'px-4 py-2 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff9898]/50 focus:border-transparent transition-shadow'

export default function AddConceptForm({ planId }: { planId: string }) {
  const [formState, action] = useActionState(addConceptAction, EMPTY_FORM_STATE)
  const noScriptFallback = useToastMessage(formState)

  return (
    <form action={action} className="mt-4 pt-4 border-t border-zinc-200">
      <div className="flex flex-wrap gap-2">
        <input type="hidden" name="planId" value={planId} />
        <Input
          type="text"
          name="label"
          required
          minLength={2}
          maxLength={255}
          placeholder="Nowe zagadnienie…"
          className={`flex-1 min-w-40 ${FIELD_CLASS}`}
        />
        <Input
          type="number"
          name="targetMinutes"
          defaultValue={CONCEPT_DEFAULT_MINUTES}
          min={5}
          max={6000}
          step={5}
          ariaLabel="Czas w minutach"
          className={`w-24 text-right ${FIELD_CLASS}`}
        />
        <div className="w-full sm:w-auto">
          <SubmitButton label="Dodaj" loading="Dodawanie…" className="sm:w-auto sm:px-5" />
        </div>
      </div>
      <FieldError name="label" formState={formState} />
      {noScriptFallback}
    </form>
  )
}
