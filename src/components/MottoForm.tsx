'use client'

import Input from '@/components/Input'
import Label from '@/components/Label'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { useActionState } from 'react'
import { updateMotto } from '@/actions/actions'
import FieldError from '@/components/FieldError'
import SubmitButton from '@/components/SubmitButton'
import { useToastMessage } from '@/hooks/useToastMessage'

export default function MottoForm() {
  const [state, action] = useActionState(updateMotto, EMPTY_FORM_STATE)
  const noScriptFallback = useToastMessage(state)

  return (
    <form action={action} className="flex-1">
      <div className="flex flex-col gap-2">
        <Label htmlFor="motto" label="Motto nauki" className="text-zinc-800 text-sm" />
        <Input
          type="text"
          id="motto"
          name="motto"
          className="w-full px-4 py-2 rounded-md border outline-none border-zinc-300 focus:ring focus:ring-red-200 transition"
          placeholder="Twoje motto"
          defaultValue={state.values?.motto || ''}
          autoComplete="motto"
        />
        <FieldError name="motto" formState={state} />
      </div>
      <SubmitButton label="Ustaw motto" loading="Ustawianie..." />
      {noScriptFallback}
    </form>
  )
}
