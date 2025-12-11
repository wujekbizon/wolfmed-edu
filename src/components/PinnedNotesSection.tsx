import { Suspense } from 'react'
import { currentUser } from '@clerk/nextjs/server'
import { getAllUserNotes } from '@/server/queries'
import TopPanel from '@/components/TopPanel'
import PinnedNotesList from '@/components/PinnedNotesList'
import PinnedNotesFeatureSkeleton from '@/components/skeletons/PinnedNotesFeatureSkeleton'
import type { NotesType } from '@/types/notesTypes'

async function PinnedNotesWithCount() {
  const user = await currentUser()

  if (!user) {
    return (
      <TopPanel pinnedCount={0}>
        <div className="p-4 text-zinc-400">Please log in to see notes</div>
      </TopPanel>
    )
  }

  const notes = (await getAllUserNotes(user.id)) as NotesType[]
  const pinnedCount = notes.filter((note) => note.pinned).length

  return (
    <TopPanel pinnedCount={pinnedCount}>
      <Suspense fallback={<PinnedNotesFeatureSkeleton />}>
        <PinnedNotesContent />
      </Suspense>
    </TopPanel>
  )
}

async function PinnedNotesContent() {
  const user = await currentUser()
  if (!user) return null

  const notes = (await getAllUserNotes(user.id)) as NotesType[]
  const pinnedNotes = notes.filter((note) => note.pinned)

  return <PinnedNotesList pinnedNotes={pinnedNotes} />
}

export default function PinnedNotesSection() {
  return (
    <Suspense fallback={
      <TopPanel pinnedCount={0}>
        <PinnedNotesFeatureSkeleton />
      </TopPanel>
    }>
      <PinnedNotesWithCount />
    </Suspense>
  )
}
