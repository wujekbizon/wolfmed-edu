import { Suspense } from 'react'
import { Metadata } from 'next'
import { fileData } from '@/server/fetchData'
import TestsCategoriesList from '@/components/TestsCategoriesList'
import TestsCategoriesListSkeleton from '@/components/skeletons/TestsCategoriesListSkeleton'
import { CATEGORY_METADATA } from '@/constants/categoryMetadata'
import { getPopulatedCategories } from '@/helpers/populateCategories'

export async function generateMetadata(): Promise<Metadata> {
  const categories = Object.entries(CATEGORY_METADATA);
  const categoryKeys = categories.map(([key]) => key).join(", ");
  const categoryDescriptions = categories.map(([_, meta]) => meta.description).join(" | ");
  const categoryKeywords = categories.flatMap(([_, meta]) => meta.keywords).join(", ")

  return {
    title: `Oferujemy testy sprawdzające dla wszystich kategorii: ${categoryKeys}`,
    description: `Przeglądaj bazę testów obejmującą kategorie: ${categoryKeys}. ${categoryDescriptions}`,
    keywords: categoryKeywords,
  }
}

export const dynamic = 'force-static'

async function TestsCategories() {
  const populatedCategories = await getPopulatedCategories(fileData)
  console.log(populatedCategories)
  return <TestsCategoriesList categories={populatedCategories} />
}

export default function TestsPage() {
  return (
    <section className='flex w-full flex-col items-center gap-8 p-4 lg:p-16'>
      <Suspense fallback={<TestsCategoriesListSkeleton />}>
        <TestsCategories />
      </Suspense>
    </section>
  )
}
