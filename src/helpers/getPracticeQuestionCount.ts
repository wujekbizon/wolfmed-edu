import 'server-only'

import { checkPremiumAccessAction } from '@/actions/course-actions'
import { getAccessibleCategories } from '@/helpers/populateCategories'
import { getUserCustomCategoryById } from '@/server/queries'

export async function getPracticeQuestionCount(userId: string, category: string) {
  const customPrefix = 'moje-testy__'
  if (category.startsWith(customPrefix)) {
    if (!(await checkPremiumAccessAction())) return 0
    const custom = await getUserCustomCategoryById(userId, category.slice(customPrefix.length))
    return custom?.questionIds.length ?? 0
  }
  const accessible = await getAccessibleCategories()
  return accessible.find((item) => item.value === category)?.count ?? 0
}
