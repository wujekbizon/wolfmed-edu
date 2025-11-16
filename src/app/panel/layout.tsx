import { Suspense } from 'react'
import { currentUser } from '@clerk/nextjs/server'
import { getAllUserNotes } from '@/server/queries'
import SidePanel from '@/app/_components/SidePanel'
import TopPanel from '@/components/TopPanel'
import PinnedNotesFeature from '@/components/PinnedNotesFeature'
import PinnedNotesFeatureSkeleton from '@/components/skeletons/PinnedNotesFeatureSkeleton'
import type { NotesType } from '@/types/notesTypes'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser()
  const notes = user ? ((await getAllUserNotes(user.id)) as NotesType[]) : []
  const pinnedCount = notes.filter((n) => n.pinned).length

  return (
    <main className="flex flex-row relative h-[calc(100vh-80px)] w-full bg-white">
      <SidePanel />
      <div id="scroll-container" className="flex-1 overflow-y-auto">
        <TopPanel pinnedCount={pinnedCount}>
          <Suspense fallback={<PinnedNotesFeatureSkeleton />}>
            <PinnedNotesFeature />
          </Suspense>
        </TopPanel>
        <div className="px-4 pb-10">
          {children}
        </div>
      </div>
    </main>
  )
}

