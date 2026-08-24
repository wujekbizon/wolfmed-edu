import { Suspense } from 'react'
import { Metadata } from 'next'
import TestsCategoriesList from '@/components/TestsCategoriesList'
import TestsCategoriesListSkeleton from '@/components/skeletons/TestsCategoriesListSkeleton'
import CategoryDeepLinkScroller from '@/components/CategoryDeepLinkScroller'
import { CATEGORY_METADATA } from '@/constants/categoryMetadata'
import { getAccessibleCategories } from '@/helpers/populateCategories'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/server/user'
import { checkPremiumAccessAction } from '@/actions/course-actions'
import { getUserCustomCategories } from '@/server/queries'
import type { PopulatedCategories } from '@/types/categoryType'

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

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

async function TestsCategories() {
  const user = await getCurrentUser()
  if (!user) redirect('/sign-in')

  const accessibleCategories = await getAccessibleCategories()

  const isPremium = await checkPremiumAccessAction()
  let customCards: PopulatedCategories[] = []

  if (isPremium) {
    const userCategories = await getUserCustomCategories(user.userId)
    customCards = userCategories.map((cat) => ({
      category: cat.categoryName,
      value: `moje-testy__${cat.id}`,
      count: cat.questionIds.length,
      hasAccess: true,
    }))
  }

  return <TestsCategoriesList categories={[...accessibleCategories, ...customCards]} />
}

export default function TestsPage() {
  return (
    <section className='w-full h-full overflow-y-auto scrollbar-webkit p-4 lg:p-16'>
      <Suspense fallback={null}>
        <CategoryDeepLinkScroller />
      </Suspense>
      <Suspense fallback={<TestsCategoriesListSkeleton />}>
        <TestsCategories />
      </Suspense>
    </section>
  )
}
