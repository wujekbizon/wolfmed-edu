import 'server-only'
import { eq } from 'drizzle-orm'
import { tests } from '@/server/db/schema'
import { PracticeQuestionDataSchema } from '@/server/schema'
import { getPracticeRevision } from '@/helpers/getPracticeRevision'
import type { PracticeQuestion, PracticeTransaction } from '@/types/learningPracticeServerTypes'

export async function loadPracticeQuestion(
  tx: PracticeTransaction, id: string, category: string,
): Promise<PracticeQuestion | null> {
  const [row] = await tx.select().from(tests).where(eq(tests.id, id)).limit(1).for('share')
  if (!row || row.meta.category !== category) return null
  const parsed = PracticeQuestionDataSchema.safeParse(row.data)
  if (!parsed.success) return null
  return { id, data: parsed.data, revision: getPracticeRevision(parsed.data) }
}
