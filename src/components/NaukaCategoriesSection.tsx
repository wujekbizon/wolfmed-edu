import CategoryGrid from './CategoryGrid'
import { getPopulatedCategories } from '@/helpers/populateCategories'
import { buildAccessibleCategories } from '@/helpers/buildAccessibleCategories'
import { getUserCustomCategories } from '@/server/queries'
import { getIsPremium } from '@/server/premium'
import type { PopulatedCategories } from '@/types/categoryType'

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

  return (
    <div className='bg-transparent xs:bg-white p-0 xs:p-4 sm:p-6 rounded-2xl shadow-none xs:shadow-xl border border-transparent xs:border-zinc-200/60'>
      <h2 className='text-xl font-bold text-zinc-800 mb-6'>Dostępne Kategorie</h2>
      <CategoryGrid categories={[...accessibleCategories, ...customCards]} />
    </div>
  )
}
