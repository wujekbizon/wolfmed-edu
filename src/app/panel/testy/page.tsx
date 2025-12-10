import { Suspense } from 'react'
import { Metadata } from 'next'
import { auth } from '@clerk/nextjs/server'
import { fileData } from '@/server/fetchData'
import { getSupporterByUserId } from '@/server/queries'
import TestsCategoriesList from '@/components/TestsCategoriesList'
import TestsCategoriesListSkeleton from '@/components/skeletons/TestsCategoriesListSkeleton'
import { CATEGORY_METADATA } from '@/constants/categoryMetadata'
import { getPopulatedCategories } from '@/helpers/populateCategories'
import { isUserAdmin } from '@/lib/adminHelpers'

export async function generateMetadata(): Promise<Metadata> {
  const categories = Object.entries(CATEGORY_METADATA);
  const categoryKeys = categories.map(([key]) => key).join(", ");
  const categoryDescriptions = categories.map(([_, meta]) => meta.description).join(" | ");
  const categoryKeywords = categories.flatMap(([_, meta]) => meta.keywords).join(", ")

  return {
    title: `Oferujemy testy sprawdzające dla wszystkich kategorii: ${categoryKeys}`,
    description: `Przeglądaj bazę testów obejmującą kategorie: ${categoryKeys}. ${categoryDescriptions}`,
    keywords: categoryKeywords,
  }
}

export const dynamic = 'force-dynamic'

async function TestsCategories() {
  const { userId } = await auth()
  const isSupporter = userId ? await getSupporterByUserId(userId) : false
  const isAdmin = await isUserAdmin()

  const populatedCategories = await getPopulatedCategories(
    fileData,
    isSupporter ? (userId || undefined) : undefined
  )

  // Hide socjologia for non-admins
  const categories = isAdmin
    ? populatedCategories
    : populatedCategories.filter(cat => cat.value !== 'socjologia')

  return <TestsCategoriesList categories={categories} />
}

export default function TestsPage() {
  return (
    <section className='w-full h-full overflow-y-auto scrollbar-webkit p-4 lg:p-16'>
      <Suspense fallback={<TestsCategoriesListSkeleton />}>
        <TestsCategories />
      </Suspense>
    </section>
  )
}
