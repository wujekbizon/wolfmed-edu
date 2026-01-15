import { Suspense } from 'react'
import { Metadata } from 'next'
import TestsCategoriesList from '@/components/TestsCategoriesList'
import TestsCategoriesListSkeleton from '@/components/skeletons/TestsCategoriesListSkeleton'
import { CATEGORY_METADATA } from '@/constants/categoryMetadata'
import { getPopulatedCategories } from '@/helpers/populateCategories'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/server/user'

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
  const user = await getCurrentUser()
  if (!user) redirect('/sign-in')

  const populatedCategories = await getPopulatedCategories()
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
