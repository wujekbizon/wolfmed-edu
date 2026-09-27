import NaukaCategoriesBrowser from './NaukaCategoriesBrowser'
import { getPopulatedCategories } from '@/helpers/populateCategories'
import { buildAccessibleCategories } from '@/helpers/buildAccessibleCategories'
import { toNaukaCategoryBrowseItems } from '@/helpers/toNaukaCategoryBrowseItems'
import { getUserCustomCategories } from '@/server/queries'
import { getIsPremium } from '@/server/premium'
import type { PopulatedCategories } from '@/types/categoryType'
import { isPracticeEnabled } from '@/server/learning/config'
import { PRACTICE_CATEGORY } from '@/constants/learningPractice'
import PracticeCategoryCta from '@/components/learning/PracticeCategoryCta'

export default async function NaukaCategoriesSection({ userId }: { userId: string }) {
  const [populatedCategories, isPremium] = await Promise.all([
    getPopulatedCategories(),
    getIsPremium(),
  ])

  const accessibleCategories = await buildAccessibleCategories(populatedCategories)

  let customCards: PopulatedCategories[] = []
  if (isPremium) {
    const userCategories = await getUserCustomCategories(userId)
    customCards = userCategories.map((cat) => ({
      category: cat.categoryName,
      value: `moje-testy__${cat.id}`,
      count: cat.questionIds.length,
      hasAccess: true,
    }))
  }

  const categories = toNaukaCategoryBrowseItems([...accessibleCategories, ...customCards])

  return (
    <div className='bg-transparent xs:bg-white p-0 xs:p-4 sm:p-6 rounded-2xl shadow-none xs:shadow-xl border border-transparent xs:border-zinc-200/60'>
      {isPracticeEnabled(PRACTICE_CATEGORY) && accessibleCategories.some((item) => item.value === PRACTICE_CATEGORY) &&
        <PracticeCategoryCta />}
      <h2 className='text-xl font-bold text-zinc-800 mb-2'>Dostępne Kategorie</h2>
      <NaukaCategoriesBrowser categories={categories} />
    </div>
  )
}
