import NotesSection from './NotesSection'
import { getAllUserNotes } from '@/server/queries'
import type { NotesType } from '@/types/notesTypes'

export default async function NaukaNotesSection({ userId }: { userId: string }) {
  const notes = (await getAllUserNotes(userId)) as NotesType[]

  return <NotesSection notes={notes} />
}
