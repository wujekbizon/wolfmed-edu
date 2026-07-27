'use client'

import { useActionState } from 'react'
import { Trash2 } from 'lucide-react'
import { deleteFlashcardAction } from '@/actions/flashcards'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { flashcardDeckKey, flashcardDecksKey } from '@/constants/flashcards'
import { useInvalidateOnSuccess } from '@/hooks/useInvalidateOnSuccess'
import { useToastMessage } from '@/hooks/useToastMessage'

interface FlashcardDeleteButtonProps {
  cardId: string
  deckId: string
}

export default function FlashcardDeleteButton({ cardId, deckId }: FlashcardDeleteButtonProps) {
  const [state, action, isPending] = useActionState(deleteFlashcardAction, EMPTY_FORM_STATE)
  const noScriptFallback = useToastMessage(state)

  useInvalidateOnSuccess(state, [flashcardDeckKey(deckId), flashcardDecksKey()])

  return (
    <form action={action}>
      <input type='hidden' name='cardId' value={cardId} />
      <button
        type='submit'
        disabled={isPending}
        className='p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer disabled:opacity-50'
        title='Usuń'
        aria-label='Usuń fiszkę'
      >
        <Trash2 className='w-3.5 h-3.5' />
      </button>
      {noScriptFallback}
    </form>
  )
}
