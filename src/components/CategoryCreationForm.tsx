'use client'

import { useActionState } from 'react'
import { createCustomCategoryAction } from '@/actions/actions'
import Input from '@/components/ui/Input'
import SubmitButton from '@/components/SubmitButton'
import FieldError from '@/components/FieldError'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { useToastMessage } from '@/hooks/useToastMessage'

export default function CategoryCreationForm() {
  const [state, action] = useActionState(createCustomCategoryAction, EMPTY_FORM_STATE)
  const noScriptFallback = useToastMessage(state)

  return (
    <form action={action} className="flex flex-col sm:flex-row gap-2">
      <Input
        type="text"
        name="categoryName"
        placeholder="Nazwa nowej kategorii..."
        className="w-full h-9 sm:h-10 rounded-lg border border-zinc-600/20 bg-white/80 px-2 sm:px-3 focus:outline-none focus:ring-2 focus:ring-red-300/20 focus:border-zinc-800/50"
        defaultValue={('values' in state && state.values?.categoryName?.toString()) || ''}
      />
      <SubmitButton
        label="Dodaj"
        loading="Dodawanie..."
        className="h-9 sm:h-10 w-full sm:w-auto rounded-lg bg-[#ffc5c5]/70 backdrop-blur-sm px-3 sm:px-4 text-zinc-800 hover:bg-[#f58a8a]/70 transition-colors border border-red-100/20 hover:border-zinc-900/10 shadow-sm whitespace-nowrap"
      />
      <FieldError name="categoryName" formState={state} />
      {noScriptFallback}
    </form>
  )
}
