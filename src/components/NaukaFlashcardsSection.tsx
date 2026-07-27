import FlashcardsSection from './FlashcardsSection'
import { getFlashcardDecksByUser } from '@/server/queries'

export default async function NaukaFlashcardsSection({ userId }: { userId: string }) {
  const decks = await getFlashcardDecksByUser(userId)

  return <FlashcardsSection initialDecks={decks} />
}
