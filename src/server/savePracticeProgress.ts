import 'server-only'

import { and, eq } from 'drizzle-orm'
import { db } from '@/server/db/index'
import { testSessions, userCustomCategories } from '@/server/db/schema'
import { SavePracticeProgressSchema } from '@/server/schema'
import { getPracticeProgressMeta } from '@/helpers/getPracticeProgressMeta'
import { mergePracticeProgress } from '@/helpers/mergePracticeProgress'
import { hasPracticeEnrollmentAccess } from '@/helpers/hasPracticeEnrollmentAccess'
import { getUserEnrollments } from '@/server/queries'

export async function persistPracticeProgress(userId: string, input: unknown) {
  const parsed = SavePracticeProgressSchema.safeParse(input)
  if (!parsed.success) return { success: false as const, message: 'Nieprawidłowy postęp testu.' }

  const { sessionId, answers } = parsed.data
  const predicate = and(
    eq(testSessions.id, sessionId),
    eq(testSessions.userId, userId),
    eq(testSessions.mode, 'PRACTICE'),
    eq(testSessions.status, 'ACTIVE')
  )
  const enrollments = await getUserEnrollments(userId)

  return db.transaction(async (tx) => {
    const [locked] = await tx.select({
      category: testSessions.category,
      questionIds: testSessions.questionIds,
      progress: testSessions.progress,
      meta: testSessions.meta,
    }).from(testSessions).where(predicate).for('update')
    if (!locked) return { success: false as const, message: 'Test próbny nie jest aktywny.' }
    if (!hasPracticeEnrollmentAccess(locked.category, enrollments)) {
      return { success: false as const, message: 'Nie masz już dostępu do tej kategorii.' }
    }
    if (locked.category.startsWith('moje-testy__')) {
      const [owned] = await tx.select({ id: userCustomCategories.id }).from(userCustomCategories).where(and(
        eq(userCustomCategories.id, locked.category.slice('moje-testy__'.length)),
        eq(userCustomCategories.userId, userId)
      )).limit(1)
      if (!owned) return { success: false as const, message: 'Nie masz już dostępu do tej kategorii.' }
    }
    if (Object.keys(answers).some((id) => !locked.questionIds.includes(id))) {
      return { success: false as const, message: 'Nieprawidłowe pytanie w postępie.' }
    }
    const meta = getPracticeProgressMeta(locked.meta)
    const merged = mergePracticeProgress(locked.progress, meta.practiceProgressVersions, answers)
    if (!merged) return {
      success: false as const,
      conflict: true as const,
      message: 'Postęp zmieniono w innym oknie. Odśwież test przed dalszą nauką.',
    }
    if (merged.progress === locked.progress) return { success: true as const }
    await tx.update(testSessions).set({
      progress: merged.progress,
      meta: { ...meta, practiceProgressVersions: merged.versions },
      lastActivityAt: new Date(),
    }).where(predicate)
    return { success: true as const }
  })
}
