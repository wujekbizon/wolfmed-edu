'use client'

import { useActionState } from 'react'
import { Layers } from 'lucide-react'
import { createEmptyDeckAction } from '@/actions/flashcardDecks'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { flashcardDecksKey } from '@/constants/flashcards'
import { useInvalidateOnSuccess } from '@/hooks/useInvalidateOnSuccess'
import { useOnFormSuccess } from '@/hooks/useOnFormSuccess'
import { useToastMessage } from '@/hooks/useToastMessage'
import FieldError from '@/components/FieldError'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Label from '@/components/ui/Label'

export default function FlashcardCellCreateDeck({
  onCreated,
  hint,
}: {
  onCreated: (deckId: string) => void
  hint?: string | undefined
}) {
  const [state, action, isPending] = useActionState(createEmptyDeckAction, EMPTY_FORM_STATE)
  const noScriptFallback = useToastMessage(state)

  useInvalidateOnSuccess(state, [flashcardDecksKey()])
  useOnFormSuccess(state, () => {
    const deckId = state.values?.deckId
    if (typeof deckId === 'string') onCreated(deckId)
  })

  return (
    <div className='flex flex-col items-center justify-center flex-1 text-center px-4'>
      <Layers className='w-8 h-8 text-[#f58a8a] mb-3' />
      <h3 className='text-lg text-zinc-600 mb-1 font-medium'>Nowy zestaw fiszek</h3>
      <p className='text-sm text-zinc-400 mb-4'>
        {hint ?? 'Nazwij zestaw, aby zacząć dodawać fiszki.'}
      </p>

      <form action={action} className='w-full max-w-sm'>
        <Label label='Nazwa zestawu' htmlFor='deck-name' />
        <Input
          id='deck-name'
          name='name'
          type='text'
          defaultValue={state.values?.name?.toString() || ''}
          placeholder='np. Fizjologia serca'
          className='flex w-full rounded-lg border border-zinc-200 bg-white/80 px-4 py-2.5 text-sm text-zinc-700 placeholder:text-zinc-400 focus:ring-2 focus:ring-[#ff9898]/50 focus:border-transparent outline-none transition-all duration-300'
        />
        <FieldError name='name' formState={state} />

        <Button type='submit' size='sm' className='w-full mt-1' disabled={isPending}>
          {isPending ? 'Tworzenie...' : 'Utwórz zestaw'}
        </Button>
        {noScriptFallback}
      </form>
    </div>
  )
}
