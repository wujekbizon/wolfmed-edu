'use client'

import { useActionState } from 'react'
import { Trash2Icon } from 'lucide-react'
import { deleteFlashcardDeckAction } from '@/actions/flashcardDecks'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { flashcardDeckKey, flashcardDecksKey, flashcardNoteDeckKey } from '@/constants/flashcards'
import { useInvalidateOnSuccess } from '@/hooks/useInvalidateOnSuccess'
import { useToastMessage } from '@/hooks/useToastMessage'
import type { FlashcardDeck } from '@/types/flashcardTypes'
import FormError from '@/components/FormError'

interface FlashcardDeckCardProps {
  deck: FlashcardDeck
  onReview: () => void
}

export default function FlashcardDeckCard({ deck, onReview }: FlashcardDeckCardProps) {
  const [state, action, isPending] = useActionState(deleteFlashcardDeckAction, EMPTY_FORM_STATE)
  const noScriptFallback = useToastMessage(state)

  useInvalidateOnSuccess(state, [
    flashcardDecksKey(),
    flashcardDeckKey(deck.id),
    ...(deck.sourceRef ? [flashcardNoteDeckKey(deck.sourceRef)] : []),
  ])

  return (
    <div className='flex flex-col justify-evenly gap-3 bg-zinc-50 border border-zinc-200 rounded-2xl shadow-sm hover:shadow-md hover:border-zinc-300 transition-all duration-300 p-5'>
      <div className='flex justify-between items-start'>
        <h3 className='text-zinc-800 font-semibold text-lg leading-tight line-clamp-1'>
          {deck.name}
        </h3>
        <span className='text-sm font-semibold px-3 py-1 text-zinc-700'>{deck.cards.length}</span>
      </div>
      {deck.cards[0] && (
        <p className='text-zinc-600 text-sm leading-relaxed line-clamp-3'>
          {deck.cards[0].questionText}
        </p>
      )}
      <div className='flex justify-between items-center'>
        <button
          type='button'
          onClick={onReview}
          className='px-3 py-1 cursor-pointer text-xs font-medium bg-gradient-to-r from-[#ff9898]/20 to-fuchsia-100 text-[#e07070] hover:from-[#ff9898]/30 rounded transition-colors'
        >
          Przeglądaj
        </button>
        <form action={action}>
          <input type='hidden' name='deckId' value={deck.id} />
          <button
            type='submit'
            disabled={isPending}
            className='p-1.5 text-zinc-600 cursor-pointer hover:text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-50'
            aria-label='Usuń zestaw fiszek'
          >
            <Trash2Icon size={16} />
          </button>
          <FormError formState={state} />
          {noScriptFallback}
        </form>
      </div>
    </div>
  )
}
