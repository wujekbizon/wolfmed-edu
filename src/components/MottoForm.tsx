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
    <form action={action} className="flex flex-col gap-3 sm:gap-4">
      <div className="flex items-center gap-2 mb-1 sm:mb-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#f58a8a]"
        >
          <path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" />
        </svg>
        <Label htmlFor="motto" label="Motto nauki" className="text-xs sm:text-sm text-zinc-700 font-medium" />
      </div>

      <div className="flex flex-col gap-1.5 sm:gap-2">
        <Input
          type="text"
          id="motto"
          name="motto"
          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-white/80 backdrop-blur-sm text-sm border border-zinc-200 outline-none focus:ring-2 focus:ring-[#ff9898]/50 transition-all duration-300 text-zinc-700 placeholder:text-zinc-400 placeholder:text-sm"
          placeholder="Twoje motto"
          defaultValue={state.values?.motto || ''}
          autoComplete="off"
        />
        <FieldError name="motto" formState={state} />
      </div>

      <SubmitButton
        label="Ustaw motto"
        loading="Ustawianie..."
        // @ts-ignore
        className="w-full mt-1 sm:mt-2 bg-gradient-to-r from-[#ff9898] to-[#ff8989] text-white py-2 sm:py-2.5 rounded-lg text-sm font-medium shadow-s transition-all duration-300 hover:from-[#ff8989] hover:to-[#ff9898] selection:disabled:opacity-50 disabled:cursor-not-allowed"
      />
      {noScriptFallback}
    </form>
  )
}
