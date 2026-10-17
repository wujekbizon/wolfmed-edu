import { WolfekQuestionError } from '@/lib/WolfekQuestionError'
import 'server-only'
import { getUserEnrolledCourses } from '@/server/queries'
import { requireCategoryAccess } from '@/server/learning/requireCategoryAccess'
import { getIsPremium } from '@/server/premium'
import type { WolfekQuestionRequest } from '@/types/wolfekResponseTypes'

export async function authorizeWolfekQuestion(userId: string | null, input: WolfekQuestionRequest) {
  if (input.route === 'kierunki') return
  if (!userId) throw new WolfekQuestionError('Zaloguj się ponownie.')
  if (input.route === 'learning.practice') {
    if (!await getIsPremium()) throw new WolfekQuestionError('Pomoc Wolfka w nauce jest dostępna w Premium.')
    if (!input.practice || await requireCategoryAccess(input.practice.category) !== userId) throw new WolfekQuestionError('Brak dostępu do karty.')
  } else if (!(await getUserEnrolledCourses(userId)).length) {
    throw new WolfekQuestionError('Brak dostępu do panelu.')
  }
}
