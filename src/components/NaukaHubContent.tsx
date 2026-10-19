import { Suspense } from 'react'
import { getCurrentUser } from '@/server/user'
import { getIsPremium } from '@/server/premium'
import NaukaLayout from './NaukaLayout'
import NaukaLibrary from './NaukaLibrary'
import NaukaCategoriesSection from './NaukaCategoriesSection'
import NaukaCellsSection from './NaukaCellsSection'
import NaukaLecturesSection from './NaukaLecturesSection'
import NaukaNotesSection from './NaukaNotesSection'
import NaukaFlashcardsSection from './NaukaFlashcardsSection'
import NaukaMaterialsSection from './NaukaMaterialsSection'
import NaukaCategoriesSkeleton from './skeletons/NaukaCategoriesSkeleton'
import NaukaCardGridSkeleton from './skeletons/NaukaCardGridSkeleton'

export default async function NaukaHubContent() {
  const [user, isPremium] = await Promise.all([getCurrentUser(), getIsPremium()])
  if (!user) return null

  return (
    <NaukaLayout
      categories={
        <Suspense fallback={<NaukaCategoriesSkeleton />}>
          <NaukaCategoriesSection userId={user.userId} />
        </Suspense>
      }
      workspace={
        <Suspense fallback={<NaukaCardGridSkeleton titleWidth='w-32' cards={1} />}>
          <NaukaCellsSection />
        </Suspense>
      }
      library={
        <NaukaLibrary
          isPremium={isPremium}
          notes={
            <Suspense fallback={<NaukaCardGridSkeleton titleWidth='w-36' />}>
              <NaukaNotesSection userId={user.userId} />
            </Suspense>
          }
          lectures={isPremium && (
            <Suspense fallback={<NaukaCardGridSkeleton titleWidth='w-36' />}>
              <NaukaLecturesSection userId={user.userId} />
            </Suspense>
          )}
          flashcards={
            <Suspense fallback={<NaukaCardGridSkeleton titleWidth='w-24' />}>
              <NaukaFlashcardsSection userId={user.userId} />
            </Suspense>
          }
          materials={
            <Suspense fallback={<NaukaCardGridSkeleton titleWidth='w-44' cards={3} />}>
              <NaukaMaterialsSection userId={user.userId} />
            </Suspense>
          }
        />
      }
    />
  )
}
