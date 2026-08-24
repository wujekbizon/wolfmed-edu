import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { requireUser } from '@/helpers/requireUser'
import { getAllUserNotes, getUserEnrolledCourses } from '@/server/queries'
import SidePanel from '@/app/_components/SidePanel'
import PinnedNotesFeature from '@/components/PinnedNotesFeature'
import PinnedNotesFeatureSkeleton from '@/components/skeletons/PinnedNotesFeatureSkeleton'
import ConfirmModal from '@/components/ConfirmModal'
import FlashcardReviewModalHost from '@/components/FlashcardReviewModalHost'
import SettingsModal from '@/components/SettingsModal'
import MobileAIFloat from '@/components/MobileAIFloat'
import type { NotesType } from '@/types/notesTypes'
import { hasAccessToTier } from '@/helpers/accessTiers'

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  await connection()
  const { userId } = await requireUser()

  const enrolledCourses = await getUserEnrolledCourses(userId)
  if (enrolledCourses.length === 0) redirect('/kierunki?from=panel')

  const isPremium = enrolledCourses.some(c => hasAccessToTier(c.accessTier, 'premium'))
  const notes = (await getAllUserNotes(userId)) as NotesType[]
  const pinnedNotes = notes.filter((note) => note.pinned)
  const pinnedCount = notes.filter((n) => n.pinned).length


  return (
    <main className='flex flex-row relative h-[calc(100vh-80px)] w-full bg-zinc-50'>
      <SidePanel
        pinnedCount={pinnedCount}
        isPremium={isPremium}
        enrolledCourseSlugs={enrolledCourses.map((c) => c.slug)}
      >
        <Suspense fallback={<PinnedNotesFeatureSkeleton />}>
          <PinnedNotesFeature pinnedNotes={pinnedNotes} />
        </Suspense>
      </SidePanel>
      <div
        id='scroll-container'
        className='flex-1 overflow-y-scroll scrollbar-webkit'
      >
        <div className='py-10'>{children}</div>
      </div>
      <ConfirmModal />
      <FlashcardReviewModalHost />
      <SettingsModal />
      <MobileAIFloat />
    </main>
  )
}
