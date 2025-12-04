import PinnedNotesSection from './PinnedNotesSection'
import type { NotesType } from '@/types/notesTypes'

export default async function PinnedNotesFeature({ pinnedNotes }: { pinnedNotes: NotesType[] }) {

  return <PinnedNotesSection pinnedNotes={pinnedNotes} />
}
