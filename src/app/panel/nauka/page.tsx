import { Suspense } from 'react'
import { Metadata } from 'next'
import { getCurrentUser } from '@/server/user'
import LearningHubHeader from '@/components/LearningHubHeader'
import NaukaCategoriesSection from '@/components/NaukaCategoriesSection'
import NaukaCellsSection from '@/components/NaukaCellsSection'
import NaukaLecturesSection from '@/components/NaukaLecturesSection'
import NaukaNotesSection from '@/components/NaukaNotesSection'
import NaukaFlashcardsSection from '@/components/NaukaFlashcardsSection'
import NaukaMaterialsSection from '@/components/NaukaMaterialsSection'
import NaukaCategoriesSkeleton from '@/components/skeletons/NaukaCategoriesSkeleton'
import NaukaCardGridSkeleton from '@/components/skeletons/NaukaCardGridSkeleton'
import PdfPreviewModal from '@/components/PdfPreviewModal'
import TextPreviewModal from '@/components/TextPreviewModal'
import UploadMaterialModal from '@/components/UploadMaterialModal'

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = {
  title: 'Baza pytań Nauka',
  description: 'Baza testów z egzaminów i kursów medycznych',
  keywords: 'nauka, egzamin, testy, pytania, zagadnienia, baza'
}

export default async function NaukaPage() {
  const user = await getCurrentUser()
  if (!user) return null

  return (
    <section className='w-full h-full overflow-y-auto scrollbar-webkit p-4 lg:p-16 bg-linear-to-br from-zinc-50/80 via-rose-50/30 to-zinc-50/80'>
      <div className='w-full space-y-8'>
        <LearningHubHeader />

        <Suspense fallback={<NaukaCategoriesSkeleton />}>
          <NaukaCategoriesSection userId={user.userId} />
        </Suspense>

        <Suspense fallback={null}>
          <NaukaCellsSection />
        </Suspense>

        <Suspense fallback={null}>
          <NaukaLecturesSection userId={user.userId} />
        </Suspense>

        <Suspense fallback={<NaukaCardGridSkeleton titleWidth='w-36' />}>
          <NaukaNotesSection userId={user.userId} />
        </Suspense>

        <Suspense fallback={null}>
          <NaukaFlashcardsSection userId={user.userId} />
        </Suspense>

        <Suspense fallback={<NaukaCardGridSkeleton titleWidth='w-44' cards={3} />}>
          <NaukaMaterialsSection userId={user.userId} />
        </Suspense>
      </div>

      <PdfPreviewModal />
      <TextPreviewModal />
      <UploadMaterialModal />
    </section>
  )
}
