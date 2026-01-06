import { Suspense } from 'react'
import { Metadata } from 'next'
import { auth } from '@clerk/nextjs/server'
import { fileData } from '@/server/fetchData'
import { getSupporterByUserId } from '@/server/queries'
import TestsCategoriesList from '@/components/TestsCategoriesList'
import TestsCategoriesListSkeleton from '@/components/skeletons/TestsCategoriesListSkeleton'
import { CATEGORY_METADATA } from '@/constants/categoryMetadata'
import { getPopulatedCategories } from '@/helpers/populateCategories'

const categories = Object.entries(CATEGORY_METADATA);
const categoryKeys = categories.map(([key]) => key).join(", ");
const categoryDescriptions = categories.map(([_, meta]) => meta.description).join(" | ");
const categoryKeywords = categories.flatMap(([_, meta]) => meta.keywords).join(", ")

export const metadata: Metadata = {
  title: `Oferujemy testy sprawdzające dla wszystkich kategorii: ${categoryKeys}`,
  description: `Przeglądaj bazę testów obejmującą kategorie: ${categoryKeys}. ${categoryDescriptions}`,
  keywords: categoryKeywords,
}

async function TestsCategories() {
  const { userId } = await auth()
  const isSupporter = userId ? await getSupporterByUserId(userId) : false

  const populatedCategories = await getPopulatedCategories(
    fileData,
    isSupporter ? (userId || undefined) : undefined
  )

  return <TestsCategoriesList categories={populatedCategories} />
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
