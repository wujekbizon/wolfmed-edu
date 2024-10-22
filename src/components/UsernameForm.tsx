'use client'

import Input from '@/components/Input'
import Label from '@/components/Label'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { useActionState } from 'react'
import { updateUsername } from '@/actions/actions'
import FieldError from '@/components/FieldError'
import SubmitButton from '@/components/SubmitButton'
import { useToastMessage } from '@/hooks/useToastMessage'

export default function UsernameForm() {
  const [state, action] = useActionState(updateUsername, EMPTY_FORM_STATE)
  const noScriptFallback = useToastMessage(state)

  return (
    <form action={action} className="flex-1">
      <div className="flex flex-col gap-2">
        <Label htmlFor="username" label="Nazwa użytkownika" className="text-zinc-800 text-sm" />
        <Input
          type="text"
          id="username"
          name="username"
          className="w-full px-4 py-2 rounded-md border outline-none border-zinc-300 focus:ring focus:ring-red-200 transition"
          placeholder="Twoja nazwa"
          defaultValue={state.values?.username || ''}
          autoComplete="username"
        />
        <FieldError name="username" formState={state} />
      </div>
      <SubmitButton label="Aktualizuj nazwę" loading="Aktualizowanie..." />
      {noScriptFallback}
    </form>
  )
}
