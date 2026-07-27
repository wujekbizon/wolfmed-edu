'use client'

import { useActionState } from 'react'
import { BookmarkPlus, X } from 'lucide-react'
import { createNoteFlashcardAction } from '@/actions/flashcardDecks'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { FLASHCARD_MODAL_TEXT } from '@/constants/studyViewer'
import { flashcardDecksKey, flashcardNoteDeckKey } from '@/constants/flashcards'
import { useInvalidateOnSuccess } from '@/hooks/useInvalidateOnSuccess'
import { useOnFormSuccess } from '@/hooks/useOnFormSuccess'
import { useToastMessage } from '@/hooks/useToastMessage'
import FieldError from '@/components/FieldError'
import Button from '@/components/ui/Button'
import Label from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'

interface FlashcardCreateModalProps {
  noteId: string
  selectedText?: string
  selectedAsAnswer?: boolean
  onClose: () => void
}

export default function FlashcardCreateModal({
  noteId,
  selectedText,
  selectedAsAnswer,
  onClose,
}: FlashcardCreateModalProps) {
  const [state, action, isPending] = useActionState(createNoteFlashcardAction, EMPTY_FORM_STATE)
  const noScriptFallback = useToastMessage(state)

  useInvalidateOnSuccess(state, [flashcardNoteDeckKey(noteId), flashcardDecksKey()])
  useOnFormSuccess(state, onClose)

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4' onClick={onClose}>
      <div
        className='bg-white rounded-xl shadow-2xl border border-zinc-200 p-6 max-w-md w-full animate-[scaleIn_0.2s_ease-out_forwards]'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center'>
              <BookmarkPlus className='w-4 h-4 text-purple-600' />
            </div>
            <h3 className='text-lg font-semibold text-zinc-900'>{FLASHCARD_MODAL_TEXT.createTitle}</h3>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer'
            aria-label={FLASHCARD_MODAL_TEXT.cancel}
          >
            <X className='w-5 h-5' />
          </button>
        </div>
        <p className='text-sm text-zinc-600 mb-4'>{FLASHCARD_MODAL_TEXT.createDescription}</p>

        <form action={action} className='space-y-3'>
          <input type='hidden' name='noteId' value={noteId} />

          <div>
            <Label label={FLASHCARD_MODAL_TEXT.questionLabel} htmlFor='flashcard-question' />
            <Textarea
              id='flashcard-question'
              name='questionText'
              defaultValue={selectedAsAnswer ? '' : (selectedText ?? '')}
              placeholder={FLASHCARD_MODAL_TEXT.questionPlaceholder}
              rows={2}
              autoFocus
            />
            <FieldError name='questionText' formState={state} />
          </div>

          <div>
            <Label label={FLASHCARD_MODAL_TEXT.answerLabel} htmlFor='flashcard-answer' />
            <Textarea
              id='flashcard-answer'
              name='answerText'
              defaultValue={selectedAsAnswer ? (selectedText ?? '') : ''}
              placeholder={FLASHCARD_MODAL_TEXT.answerPlaceholder}
              rows={3}
            />
            <FieldError name='answerText' formState={state} />
          </div>

          <div className='flex items-center justify-end gap-3 pt-1'>
            <Button variant='ghost' onClick={onClose}>
              {FLASHCARD_MODAL_TEXT.cancel}
            </Button>
            <Button variant='accent' type='submit' disabled={isPending}>
              {isPending ? 'Zapisywanie...' : FLASHCARD_MODAL_TEXT.submit}
            </Button>
          </div>
          {noScriptFallback}
        </form>
      </div>
    </div>
  )
}
