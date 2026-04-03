import { Suspense } from 'react'
import { currentUser } from '@clerk/nextjs/server'
import { getAllUserNotes } from '@/server/queries'
import SidePanel from '@/app/_components/SidePanel'
import PinnedNotesFeature from '@/components/PinnedNotesFeature'
import PinnedNotesFeatureSkeleton from '@/components/skeletons/PinnedNotesFeatureSkeleton'
import ConfirmModal from '@/components/ConfirmModal'
import SettingsModal from '@/components/SettingsModal'
import MobileAIFloat from '@/components/MobileAIFloat'
import type { NotesType } from '@/types/notesTypes'
import { redirect } from 'next/dist/client/components/navigation'
import { checkPremiumAccessAction } from '@/actions/course-actions'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser()
  const notes = user ? ((await getAllUserNotes(user.id)) as NotesType[]) : []
  const pinnedNotes = notes.filter((note) => note.pinned)
  const pinnedCount = notes.filter((n) => n.pinned).length

  const isPremium = await checkPremiumAccessAction()

  return (
    <main className="flex flex-row relative h-[calc(100vh-80px)] w-full bg-zinc-50">
      <SidePanel pinnedCount={pinnedCount} isPremium={isPremium}>
        <Suspense fallback={<PinnedNotesFeatureSkeleton />}>
          <PinnedNotesFeature pinnedNotes={pinnedNotes} />
        </Suspense>
      </SidePanel>
      <div id="scroll-container" className="flex-1 overflow-y-scroll scrollbar-webkit">
        <div className="py-10">
          {children}
        </div>
      </div>
      <ConfirmModal />
      <SettingsModal />
      <MobileAIFloat />
    </main>
  )
}
