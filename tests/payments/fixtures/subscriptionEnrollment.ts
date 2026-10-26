import { registerHooks } from 'node:module'
import { PgDialect } from 'drizzle-orm/pg-core'
import type { SQL } from 'drizzle-orm'
import type { EnglishBonusSource } from '@/types/englishBonusTypes'
import type { PaymentTransaction } from '@/types/dbTypes'

export const now = new Date('2026-10-26T13:32:39.465Z')
export const rows: EnglishBonusSource[] = []
export const writes: string[] = []
export const parent: EnglishBonusSource = {
  userId: 'user_1', courseSlug: 'opiekun-medyczny', accessTier: 'premium',
  sourceType: 'subscription', sourceId: 'sub_1', isActive: true,
  enrolledAt: new Date('2026-09-26T12:31:24Z'),
  startsAt: new Date('2026-09-26T12:31:05Z'),
  expiresAt: new Date('2026-10-26T12:31:05Z'), revokedAt: null,
}
export const bonus: EnglishBonusSource = {
  ...parent, courseSlug: 'angielski-medyczny', accessTier: 'basic',
  sourceType: 'premium_bundle', sourceId: 'subscription:sub_1', startsAt: null,
}

export const tx = {
  insert: () => ({ values: (values: EnglishBonusSource) => ({
    onConflictDoUpdate: async ({ set }: { set: Partial<EnglishBonusSource> }) => {
      const row = rows.find((row) => row.sourceType === values.sourceType && row.sourceId === values.sourceId)
      if (row) Object.assign(row, set)
      else rows.push({ ...values })
      writes.push('upsert')
    },
  }) }),
  update: () => ({ set: (values: Partial<EnglishBonusSource>) => ({
    where: async (condition: SQL) => {
      const { params } = new PgDialect().sqlToQuery(condition)
      for (const row of rows) {
        if ([row.userId, row.sourceType, row.sourceId].every((value) => params.includes(value))) {
          Object.assign(row, values)
        }
      }
      writes.push('update')
    },
  }) }),
} as unknown as PaymentTransaction

export const hooks = registerHooks({ resolve(specifier, context, nextResolve) {
  return specifier === 'server-only'
    ? { url: 'data:text/javascript,export {}', shortCircuit: true }
    : nextResolve(specifier, context)
} })
