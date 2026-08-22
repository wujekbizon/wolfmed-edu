'use server'

import { auth } from '@clerk/nextjs/server'
import {
  getFlashcardDeckById,
  getFlashcardDeckByNoteId,
  getFlashcardDecksByUser,
} from '@/server/queries'
import type { FlashcardDeck } from '@/types/flashcardTypes'

export async function fetchFlashcardDecksAction(): Promise<FlashcardDeck[]> {
  const { userId } = await auth()
  if (!userId) return []

  return getFlashcardDecksByUser(userId)
}

export async function fetchFlashcardDeckAction(
  deckId: string
): Promise<FlashcardDeck | null> {
  const { userId } = await auth()
  if (!userId) return null

  return getFlashcardDeckById(userId, deckId)
}

export async function fetchNoteFlashcardDeckAction(
  noteId: string
): Promise<FlashcardDeck | null> {
  const { userId } = await auth()
  if (!userId) return null

  return getFlashcardDeckByNoteId(userId, noteId)
}
