'use client'

import { useActionState } from 'react'
import { Check, X } from 'lucide-react'
import { updateFlashcardAction } from '@/actions/flashcards'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { flashcardDeckKey, flashcardDecksKey } from '@/constants/flashcards'
import { useInvalidateOnSuccess } from '@/hooks/useInvalidateOnSuccess'
import { useOnFormSuccess } from '@/hooks/useOnFormSuccess'
import { useToastMessage } from '@/hooks/useToastMessage'
import FieldError from '@/components/FieldError'
import Button from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import type { Flashcard } from '@/types/flashcardTypes'

interface FlashcardEditFormProps {
  card: Flashcard
  onDone: () => void
}

export default function FlashcardEditForm({ card, onDone }: FlashcardEditFormProps) {
  const [state, action, isPending] = useActionState(updateFlashcardAction, EMPTY_FORM_STATE)
  const noScriptFallback = useToastMessage(state)

  useInvalidateOnSuccess(state, [flashcardDeckKey(card.deckId), flashcardDecksKey()])
  useOnFormSuccess(state, onDone)

  return (
    <form action={action} className='bg-purple-50 border border-purple-200 rounded-xl p-4 space-y-2'>
      <input type='hidden' name='cardId' value={card.id} />

      <Textarea
        name='questionText'
        defaultValue={card.questionText}
        placeholder='Pytanie'
        rows={2}
        aria-label='Pytanie'
      />
      <FieldError name='questionText' formState={state} />

      <Textarea
        name='answerText'
        defaultValue={card.answerText}
        placeholder='Odpowiedź'
        rows={2}
        aria-label='Odpowiedź'
      />
      <FieldError name='answerText' formState={state} />

      <div className='flex gap-2 justify-end'>
        <Button variant='secondary' size='sm' onClick={onDone}>
          <X className='w-3 h-3' />
          Anuluj
        </Button>
        <Button variant='accent' size='sm' type='submit' disabled={isPending}>
          <Check className='w-3 h-3' />
          {isPending ? 'Zapisywanie...' : 'Zapisz'}
        </Button>
      </div>
      {noScriptFallback}
    </form>
  )
}
