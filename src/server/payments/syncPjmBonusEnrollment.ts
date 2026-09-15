import 'server-only'

import { and, eq } from 'drizzle-orm'
import { courseEnrollments } from '@/server/db/schema'
import { getPjmBonusGrant } from '@/helpers/getPjmBonusGrant'
import type { PaymentTransaction } from '@/types/dbTypes'
import type { PjmBonusSource } from '@/types/pjmBonusTypes'

export async function syncPjmBonusEnrollment(
  tx: PaymentTransaction,
  source: PjmBonusSource,
  now = new Date()
): Promise<void> {
  const bonus = getPjmBonusGrant(source, now)
  if (!bonus) return

  const access = {
    isActive: bonus.isActive,
    startsAt: bonus.startsAt,
    expiresAt: bonus.expiresAt,
    revokedAt: bonus.revokedAt,
  }

  if (!bonus.isActive) {
    await tx.update(courseEnrollments).set(access).where(and(
      eq(courseEnrollments.userId, bonus.userId),
      eq(courseEnrollments.sourceType, bonus.sourceType),
      eq(courseEnrollments.sourceId, bonus.sourceId)
    ))
    return
  }

  await tx.insert(courseEnrollments).values(bonus).onConflictDoUpdate({
    target: [courseEnrollments.sourceType, courseEnrollments.sourceId],
    set: access,
  })
}
