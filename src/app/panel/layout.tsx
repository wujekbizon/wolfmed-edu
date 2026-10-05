import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { requireUser } from '@/helpers/requireUser'
import { getAllUserNotes, getUserEnrolledCourses } from '@/server/queries'
import SidePanel from '@/app/_components/SidePanel'
import PinnedNotesFeature from '@/components/PinnedNotesFeature'
import PinnedNotesFeatureSkeleton from '@/components/skeletons/PinnedNotesFeatureSkeleton'
import PanelLayoutSkeleton from '@/components/skeletons/PanelLayoutSkeleton'
import ConfirmModal from '@/components/ConfirmModal'
import FlashcardReviewModalHost from '@/components/FlashcardReviewModalHost'
import SettingsModal from '@/components/SettingsModal'
import MobileAIFloat from '@/components/MobileAIFloat'
import type { NotesType } from '@/types/notesTypes'
import { hasAccessToTier } from '@/helpers/accessTiers'

async function PanelAccessContent({ children }: { children: React.ReactNode }) {
  const { userId } = await requireUser()

  const [enrolledCourses, notes] = await Promise.all([
    getUserEnrolledCourses(userId),
    getAllUserNotes(userId),
  ])

  if (enrolledCourses.length === 0) redirect('/kierunki?from=panel')

  const isPremium = enrolledCourses.some(c => hasAccessToTier(c.accessTier, 'premium'))
  const userNotes = notes as NotesType[]
  const pinnedNotes = userNotes.filter((note) => note.pinned)
  const pinnedCount = pinnedNotes.length

  return (
    <>
      <SidePanel
        pinnedCount={pinnedCount}
        isPremium={isPremium}
        enrolledCourseSlugs={enrolledCourses.map((c) => c.slug)}
      >
        <Suspense fallback={<PinnedNotesFeatureSkeleton />}>
          <PinnedNotesFeature pinnedNotes={pinnedNotes} />
        </Suspense>
      </SidePanel>
      <div id='scroll-container' className='min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain scrollbar-webkit'>
        <div className='py-10'>{children}</div>
      </div>
    </>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className='relative flex h-[calc(100dvh-5rem)] min-h-0 w-full flex-row overflow-hidden bg-zinc-50'>
      <Suspense fallback={<PanelLayoutSkeleton />}>
        <PanelAccessContent>{children}</PanelAccessContent>
        <MobileAIFloat />
      </Suspense>
      <ConfirmModal />
      <FlashcardReviewModalHost />
      <SettingsModal />
    </main>
  )
}
