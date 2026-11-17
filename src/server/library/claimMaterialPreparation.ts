import 'server-only'
import { and, eq, inArray, isNull, lt, or } from 'drizzle-orm'
import { db } from '@/server/db'
import { materials } from '@/server/db/schema'

export async function claimMaterialPreparation(userId: string, materialId: string) {
  const [claimed] = await db.update(materials).set({ indexStatus: 'pending', indexedAt: new Date() })
    .where(and(eq(materials.id, materialId), eq(materials.userId, userId),
      inArray(materials.indexStatus, ['pending', 'failed']),
      or(eq(materials.indexStatus, 'failed'), isNull(materials.indexedAt), lt(materials.indexedAt, new Date(Date.now() - 5 * 60_000)))))
    .returning()
  return claimed
}
