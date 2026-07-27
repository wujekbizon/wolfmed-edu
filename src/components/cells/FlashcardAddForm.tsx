'use client'

import { useActionState, useRef } from 'react'
import { createFlashcardAction } from '@/actions/flashcards'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { flashcardDeckKey, flashcardDecksKey } from '@/constants/flashcards'
import { useInvalidateOnSuccess } from '@/hooks/useInvalidateOnSuccess'
import { useOnFormSuccess } from '@/hooks/useOnFormSuccess'
import { useToastMessage } from '@/hooks/useToastMessage'
import FieldError from '@/components/FieldError'
import Button from '@/components/ui/Button'
import Label from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'

interface FlashcardAddFormProps {
  deckId: string
  onDone: () => void
}

export default function FlashcardAddForm({ deckId, onDone }: FlashcardAddFormProps) {
  const [state, action, isPending] = useActionState(createFlashcardAction, EMPTY_FORM_STATE)
  const formRef = useRef<HTMLFormElement>(null)
  const noScriptFallback = useToastMessage(state)

  useInvalidateOnSuccess(state, [flashcardDeckKey(deckId), flashcardDecksKey()])
  useOnFormSuccess(state, () => formRef.current?.reset())

  return (
    <form
      ref={formRef}
      action={action}
      className='bg-linear-to-br from-zinc-50/80 via-rose-50/30 to-zinc-50/80 backdrop-blur-sm rounded-xl p-4 space-y-2'
    >
      <input type='hidden' name='deckId' value={deckId} />

      <Label label='Pytanie:' htmlFor='new-question' />
      <Textarea id='new-question' name='questionText' placeholder='Dodaj pytanie do fiszki' />
      <FieldError name='questionText' formState={state} />

      <Label label='Odpowiedź:' htmlFor='new-answer' />
      <Textarea id='new-answer' name='answerText' placeholder='Dodaj odpowiedź do fiszki' />
      <FieldError name='answerText' formState={state} />

      <div className='flex gap-2 justify-end'>
        <Button variant='secondary' onClick={onDone}>
          Anuluj
        </Button>
        <Button type='submit' disabled={isPending}>
          {isPending ? 'Dodawanie...' : 'Dodaj'}
        </Button>
      </div>
      {noScriptFallback}
    </form>
  )
}
