'use server'

import { db } from '@/server/db/index'
import { flashcards } from '@/server/db/schema'
import { eq } from 'drizzle-orm'
import { auth } from '@clerk/nextjs/server'
import { fromErrorToFormState, toFormState } from '@/helpers/toFormState'
import { rateLimitFormState } from '@/helpers/rateLimitFormState'
import { findOwnedCard, findOwnedDeck, nextCardPosition } from '@/server/flashcardAccess'
import {
  CreateFlashcardSchema,
  FlashcardIdSchema,
  UpdateFlashcardSchema,
} from '@/server/schema'
import type { FormState } from '@/types/actionTypes'

export async function createFlashcardAction(
  formState: FormState,
  formData: FormData
): Promise<FormState> {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const limited = await rateLimitFormState(userId, 'flashcard:create')
  if (limited) return limited

  const parsed = CreateFlashcardSchema.safeParse({
    deckId: formData.get('deckId'),
    questionText: formData.get('questionText'),
    answerText: formData.get('answerText'),
  })
  if (!parsed.success) return fromErrorToFormState(parsed.error)

  const deck = await findOwnedDeck(userId, parsed.data.deckId)
  if (!deck) {
    return { ...toFormState('ERROR', ''), fieldErrors: { deckId: ['Nie znaleziono zestawu fiszek.'] } }
  }

  try {
    await db.insert(flashcards).values({
      deckId: deck.id,
      questionText: parsed.data.questionText,
      answerText: parsed.data.answerText,
      position: await nextCardPosition(deck.id),
    })
  } catch (error) {
    return fromErrorToFormState(error)
  }

  return toFormState('SUCCESS', 'Fiszka dodana')
}

export async function updateFlashcardAction(
  formState: FormState,
  formData: FormData
): Promise<FormState> {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const limited = await rateLimitFormState(userId, 'flashcard:update')
  if (limited) return limited

  const parsed = UpdateFlashcardSchema.safeParse({
    cardId: formData.get('cardId'),
    questionText: formData.get('questionText'),
    answerText: formData.get('answerText'),
  })
  if (!parsed.success) return fromErrorToFormState(parsed.error)

  const card = await findOwnedCard(userId, parsed.data.cardId)
  if (!card) {
    return { ...toFormState('ERROR', ''), fieldErrors: { cardId: ['Nie znaleziono fiszki.'] } }
  }

  try {
    await db
      .update(flashcards)
      .set({
        questionText: parsed.data.questionText,
        answerText: parsed.data.answerText,
        updatedAt: new Date(),
      })
      .where(eq(flashcards.id, card.id))
  } catch (error) {
    return fromErrorToFormState(error)
  }

  return toFormState('SUCCESS', 'Fiszka zaktualizowana')
}

export async function deleteFlashcardAction(
  formState: FormState,
  formData: FormData
): Promise<FormState> {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const limited = await rateLimitFormState(userId, 'flashcard:delete')
  if (limited) return limited

  const parsed = FlashcardIdSchema.safeParse({ cardId: formData.get('cardId') })
  if (!parsed.success) return fromErrorToFormState(parsed.error)

  const card = await findOwnedCard(userId, parsed.data.cardId)
  if (!card) {
    return { ...toFormState('ERROR', ''), fieldErrors: { cardId: ['Nie znaleziono fiszki.'] } }
  }

  try {
    await db.delete(flashcards).where(eq(flashcards.id, card.id))
  } catch (error) {
    return fromErrorToFormState(error)
  }

  return toFormState('SUCCESS', 'Fiszka usunięta')
}
