import AllTests from '@/components/AllTests'
import { CUSTOM_TEST_CATEGORY_PREFIX } from '@/constants/naukaCategoriesBrowse'
import { getCachedTestsByCategory } from '@/server/tests/getCachedTestsByCategory'
import {
  getUserCustomCategoryById,
  getUserCustomTestsByIds,
} from '@/server/queries'
import { getCurrentUser } from '@/server/user'
import type { CategoryPageProps } from '@/types/categoryPageTypes'
import type { Test } from '@/types/dataTypes'
import { redirect } from 'next/navigation'

export default async function TestsByCategoryContent({ params }: CategoryPageProps) {
  const { category } = await params
  const decodedCategory = decodeURIComponent(category)
  const user = await getCurrentUser()
  if (!user) redirect('/sign-in')

  let tests: Test[]
  if (decodedCategory.startsWith(CUSTOM_TEST_CATEGORY_PREFIX)) {
    const categoryId = decodedCategory.slice(CUSTOM_TEST_CATEGORY_PREFIX.length)
    const customCategory = await getUserCustomCategoryById(user.userId, categoryId)
    if (!customCategory) redirect('/panel/nauka')
    tests = (await getUserCustomTestsByIds(customCategory.questionIds)) as Test[]
  } else {
    tests = (await getCachedTestsByCategory(decodedCategory)) as Test[]
  }

  return <AllTests tests={tests} category={decodedCategory} />
}
