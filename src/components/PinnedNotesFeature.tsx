import { currentUser } from '@clerk/nextjs/server'
import { getAllUserNotes } from '@/server/queries'
import PinnedNotesSection from './PinnedNotesSection'
import type { NotesType } from '@/types/notesTypes'

export default async function PinnedNotesFeature() {
  const user = await currentUser()

  if (!user) return null

  const notes = (await getAllUserNotes(user.id)) as NotesType[]
  const pinnedNotes = notes.filter((note) => note.pinned)

  return <PinnedNotesSection pinnedNotes={pinnedNotes} />
}
