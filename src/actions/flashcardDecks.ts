'use server'

import { db } from '@/server/db/index'
import { flashcardDecks, flashcards } from '@/server/db/schema'
import { and, eq } from 'drizzle-orm'
import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { fromErrorToFormState, toFormState } from '@/helpers/toFormState'
import { rateLimitFormState } from '@/helpers/rateLimitFormState'
import { findOwnedDeck, nextCardPosition } from '@/server/flashcardAccess'
import { getNoteById } from '@/server/queries'
import {
  CreateGeneratedDeckSchema,
  CreateNoteFlashcardSchema,
  DeckIdSchema,
  DeckNameSchema,
  RenameDeckSchema,
} from '@/server/schema'
import type { FormState } from '@/types/actionTypes'

export async function createGeneratedDeckAction(
  name: string,
  cards: { questionText: string; answerText: string }[]
): Promise<{ success: boolean; deckId?: string; error?: string }> {
  const { userId } = await auth()
  if (!userId) return { success: false, error: 'Unauthorized' }

  const limited = await rateLimitFormState(userId, 'flashcard:deck:create')
  if (limited) return { success: false, error: limited.message }

  const parsed = CreateGeneratedDeckSchema.safeParse({ name, cards })
  if (!parsed.success) return { success: false, error: 'Nieprawidłowy zestaw fiszek' }

  try {
    const deckId = await db.transaction(async (tx) => {
      const [deck] = await tx
        .insert(flashcardDecks)
        .values({ userId, name: parsed.data.name, sourceType: 'ai' })
        .returning({ id: flashcardDecks.id })

      if (!deck) throw new Error('Nie udało się utworzyć zestawu fiszek')

      await tx.insert(flashcards).values(
        parsed.data.cards.map((card, index) => ({
          deckId: deck.id,
          questionText: card.questionText,
          answerText: card.answerText,
          position: index,
        }))
      )

      return deck.id
    })

    revalidatePath('/panel/nauka')
    return { success: true, deckId }
  } catch (error) {
    console.error('Failed to create generated deck:', error)
    return { success: false, error: 'Nie udało się zapisać fiszek' }
  }
}

export async function createEmptyDeckAction(
  formState: FormState,
  formData: FormData
): Promise<FormState> {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const limited = await rateLimitFormState(userId, 'flashcard:deck:create')
  if (limited) return limited

  const parsed = DeckNameSchema.safeParse(formData.get('name'))
  if (!parsed.success) {
    return { ...toFormState('ERROR', ''), fieldErrors: { name: [parsed.error.issues[0]!.message] } }
  }

  try {
    const [deck] = await db
      .insert(flashcardDecks)
      .values({ userId, name: parsed.data, sourceType: 'manual' })
      .returning({ id: flashcardDecks.id })

    if (!deck) throw new Error('Nie udało się utworzyć zestawu fiszek')

    revalidatePath('/panel/nauka')
    return { ...toFormState('SUCCESS', 'Zestaw fiszek utworzony'), values: { deckId: deck.id } }
  } catch (error) {
    return fromErrorToFormState(error)
  }
}

export async function createNoteFlashcardAction(
  formState: FormState,
  formData: FormData
): Promise<FormState> {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const limited = await rateLimitFormState(userId, 'flashcard:create')
  if (limited) return limited

  const parsed = CreateNoteFlashcardSchema.safeParse({
    noteId: formData.get('noteId'),
    questionText: formData.get('questionText'),
    answerText: formData.get('answerText'),
  })
  if (!parsed.success) return fromErrorToFormState(parsed.error)

  const note = await getNoteById(userId, parsed.data.noteId)
  if (!note) {
    return { ...toFormState('ERROR', ''), fieldErrors: { noteId: ['Nie znaleziono notatki.'] } }
  }

  try {
    const deckId = await resolveNoteDeckId(userId, note.id, note.title)

    await db.insert(flashcards).values({
      deckId,
      questionText: parsed.data.questionText,
      answerText: parsed.data.answerText,
      position: await nextCardPosition(deckId),
    })
  } catch (error) {
    return fromErrorToFormState(error)
  }

  revalidatePath(`/panel/nauka/notatki/${note.id}`)
  revalidatePath('/panel/nauka')
  return toFormState('SUCCESS', 'Fiszka dodana')
}

async function resolveNoteDeckId(userId: string, noteId: string, noteTitle: string) {
  const [created] = await db
    .insert(flashcardDecks)
    .values({ userId, name: noteTitle, sourceType: 'note', sourceRef: noteId })
    .onConflictDoNothing()
    .returning({ id: flashcardDecks.id })

  if (created) return created.id

  const [existing] = await db
    .select({ id: flashcardDecks.id })
    .from(flashcardDecks)
    .where(and(eq(flashcardDecks.userId, userId), eq(flashcardDecks.sourceRef, noteId)))
    .limit(1)

  if (!existing) throw new Error('Nie udało się utworzyć zestawu fiszek')
  return existing.id
}

export async function renameFlashcardDeckAction(
  formState: FormState,
  formData: FormData
): Promise<FormState> {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const limited = await rateLimitFormState(userId, 'flashcard:update')
  if (limited) return limited

  const parsed = RenameDeckSchema.safeParse({
    deckId: formData.get('deckId'),
    name: formData.get('name'),
  })
  if (!parsed.success) return fromErrorToFormState(parsed.error)

  const deck = await findOwnedDeck(userId, parsed.data.deckId)
  if (!deck) {
    return { ...toFormState('ERROR', ''), fieldErrors: { deckId: ['Nie znaleziono zestawu fiszek.'] } }
  }

  try {
    await db
      .update(flashcardDecks)
      .set({ name: parsed.data.name, updatedAt: new Date() })
      .where(eq(flashcardDecks.id, deck.id))
  } catch (error) {
    return fromErrorToFormState(error)
  }

  revalidatePath('/panel/nauka')
  return toFormState('SUCCESS', 'Nazwa zestawu zmieniona')
}

export async function deleteFlashcardDeckAction(
  formState: FormState,
  formData: FormData
): Promise<FormState> {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  const limited = await rateLimitFormState(userId, 'flashcard:deck:delete')
  if (limited) return limited

  const parsed = DeckIdSchema.safeParse({ deckId: formData.get('deckId') })
  if (!parsed.success) return fromErrorToFormState(parsed.error)

  const deck = await findOwnedDeck(userId, parsed.data.deckId)
  if (!deck) {
    return { ...toFormState('ERROR', ''), fieldErrors: { deckId: ['Nie znaleziono zestawu fiszek.'] } }
  }

  try {
    await db.delete(flashcardDecks).where(eq(flashcardDecks.id, deck.id))
  } catch (error) {
    return fromErrorToFormState(error)
  }

  revalidatePath('/panel/nauka')
  return toFormState('SUCCESS', 'Zestaw fiszek usunięty')
}
