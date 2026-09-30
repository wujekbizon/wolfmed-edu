import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { and, eq, inArray } from 'drizzle-orm'
import AllTests from '@/components/AllTests'
import AllTestsBrowse from '@/components/AllTestsBrowse'
import { db } from '@/server/db/index'
import { userCustomTests } from '@/server/db/schema'
import { getTestsByCategory, getUserCustomCategoryById } from '@/server/queries'
import { checkPremiumAccessAction } from '@/actions/course-actions'
import { requireCategoryAccess } from '@/server/learning/requireCategoryAccess'
import { readPracticeSession } from '@/server/learning/readSession'
import { toLearningQuestionCardData } from '@/helpers/toLearningQuestionCardData'
import type { LearningCategoryProps } from '@/types/learningPracticeTypes'
import type { Test } from '@/types/dataTypes'

export default async function CategoryContent({ params }: LearningCategoryProps) {
  const { category } = await params
  // Category names can contain URL-encoded Polish characters.
  const decoded = decodeURIComponent(category)
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  const custom = decoded.startsWith('moje-testy__')
  if (!custom) {
    try { await requireCategoryAccess(decoded) }
    catch { redirect('/panel/nauka') }
  }
  if (custom) {
    if (!await checkPremiumAccessAction()) redirect('/panel/nauka')
    const categoryRow = await getUserCustomCategoryById(userId, decoded.slice('moje-testy__'.length))
    if (!categoryRow) redirect('/panel/nauka')
    const tests = categoryRow.questionIds.length ? await db.select().from(userCustomTests).where(and(
      eq(userCustomTests.userId, userId), inArray(userCustomTests.id, categoryRow.questionIds),
    )) as Test[] : []
    return <AllTestsBrowse key={`${userId}:${decoded}`} tests={tests} category={decoded} userId={userId} />
  }
  const tests = await getTestsByCategory(decoded) as Test[]
  const [session, premium] = await Promise.all([
    readPracticeSession(userId, decoded), checkPremiumAccessAction(),
  ])
  const questions = toLearningQuestionCardData(tests)
  return <AllTests key={`${userId}:${decoded}`} userId={userId} category={decoded}
    questions={questions} initialSession={session}
    premium={premium} />
}
