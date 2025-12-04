import { Suspense } from 'react'
import { currentUser } from '@clerk/nextjs/server'
import { getAllUserNotes } from '@/server/queries'
import SidePanel from '@/app/_components/SidePanel'
import TopPanel from '@/components/TopPanel'
import PinnedNotesFeature from '@/components/PinnedNotesFeature'
import PinnedNotesFeatureSkeleton from '@/components/skeletons/PinnedNotesFeatureSkeleton'
import ConfirmModal from '@/components/ConfirmModal'
import type { NotesType } from '@/types/notesTypes'

async function PanelLayoutContent({ children }: { children: React.ReactNode }) {
  "use cache: private"
  
  const user = await currentUser()
  const notes = user ? ((await getAllUserNotes(user.id)) as NotesType[]) : []
  const pinnedNotes = notes.filter((note) => note.pinned)
  const pinnedCount = notes.filter((n) => n.pinned).length

  return (
    <div id="scroll-container" className="flex-1 overflow-y-scroll scrollbar-webkit">
      <TopPanel pinnedCount={pinnedCount}>
        <PinnedNotesFeature pinnedNotes={pinnedNotes} />
      </TopPanel>
      <div className="py-10">
        {children}
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-row relative h-[calc(100vh-80px)] w-full bg-white">
      <SidePanel />
      <Suspense fallback={
        <div className="flex-1 overflow-y-scroll scrollbar-webkit">
          <div className="py-10">
            {children}
          </div>
        </div>
      }>
        <PanelLayoutContent>{children}</PanelLayoutContent>
      </Suspense>
      <ConfirmModal />
    </main>
  )
}

