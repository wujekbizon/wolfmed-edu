import { getFlashcardDeckByNoteId } from '@/server/queries'
import NoteFlashcardsPanel from './NoteFlashcardsPanel'

export default async function NoteFlashcardsSection({
  noteId,
  userId,
}: {
  noteId: string
  userId: string
}) {
  const deck = await getFlashcardDeckByNoteId(userId, noteId)

  return <NoteFlashcardsPanel noteId={noteId} initialDeck={deck} />
}
