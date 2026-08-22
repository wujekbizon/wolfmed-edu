import 'server-only'
import { db } from '@/server/db/index'
import { flashcardDecks, flashcards } from '@/server/db/schema'
import { and, eq } from 'drizzle-orm'

export async function findOwnedDeck(userId: string, deckId: string) {
  const rows = await db
    .select({ id: flashcardDecks.id, name: flashcardDecks.name })
    .from(flashcardDecks)
    .where(and(eq(flashcardDecks.id, deckId), eq(flashcardDecks.userId, userId)))
    .limit(1)

  return rows[0] ?? null
}

export async function findOwnedCard(userId: string, cardId: string) {
  const rows = await db
    .select({ id: flashcards.id, deckId: flashcards.deckId })
    .from(flashcards)
    .innerJoin(flashcardDecks, eq(flashcards.deckId, flashcardDecks.id))
    .where(and(eq(flashcards.id, cardId), eq(flashcardDecks.userId, userId)))
    .limit(1)

  return rows[0] ?? null
}

export async function nextCardPosition(deckId: string) {
  const rows = await db
    .select({ position: flashcards.position })
    .from(flashcards)
    .where(eq(flashcards.deckId, deckId))
    .orderBy(flashcards.position)

  return rows.length === 0 ? 0 : (rows[rows.length - 1]?.position ?? 0) + 1
}
