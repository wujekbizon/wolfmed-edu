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
    <form action={action} className="flex flex-col gap-3 sm:gap-4">
      <div className="flex items-center gap-2 mb-1 sm:mb-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#f58a8a]"
        >
          <path
            fillRule="evenodd"
            d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
            clipRule="evenodd"
          />
        </svg>
        <Label htmlFor="username" label="Nazwa użytkownika" className="text-xs sm:text-sm text-zinc-700 font-medium" />
      </div>

      <div className="flex flex-col gap-1.5 sm:gap-2">
        <Input
          type="text"
          id="username"
          name="username"
          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-white/80 backdrop-blur-sm text-sm border border-zinc-200 outline-none focus:ring-2 focus:ring-[#ff9898]/50 transition-all duration-300 text-zinc-700 placeholder:text-zinc-400 placeholder:text-sm"
          placeholder="Twoja nazwa"
          defaultValue={state.values?.username || ''}
          autoComplete="username"
        />
        <FieldError name="username" formState={state} />
      </div>

      <SubmitButton
        label="Aktualizuj nazwę"
        loading="Aktualizowanie..."
        // @ts-ignore
        className="w-full mt-1 sm:mt-2 bg-linear-to-r from-[#ff9898] to-[#ff8989] text-white py-2 sm:py-2.5 rounded-lg text-sm font-medium shadow-sm hover:shadow-mdtransition-all duration-300 hover:from-[#ff8989] hover:to-[#ff9898] disabled:opacity-50 disabled:cursor-not-allowed"
      />
      {noScriptFallback}
    </form>
  )
}
