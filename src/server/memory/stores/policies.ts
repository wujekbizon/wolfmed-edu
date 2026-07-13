import 'server-only'
import { and, eq, isNull, sql } from 'drizzle-orm'
import { db } from '@/server/db/index'
import { memPolicies, type MemPolicy } from '@/server/db/memory-schema'
import { TENANT_ID } from '../config'

export type PolicyType = 'pedagogy' | 'guardrail' | 'blueprint' | 'product'

// Policies are matched by exact key only, never by similarity. "Active" = the
// version with no effective_until.
export async function getActivePolicies(tenantId: string = TENANT_ID): Promise<MemPolicy[]> {
  return db
    .select()
    .from(memPolicies)
    .where(and(eq(memPolicies.tenantId, tenantId), isNull(memPolicies.effectiveUntil)))
    .orderBy(memPolicies.policyKey)
}

export async function getPolicy(
  policyKey: string,
  tenantId: string = TENANT_ID
): Promise<MemPolicy | null> {
  const [row] = await db
    .select()
    .from(memPolicies)
    .where(
      and(
        eq(memPolicies.tenantId, tenantId),
        eq(memPolicies.policyKey, policyKey),
        isNull(memPolicies.effectiveUntil)
      )
    )
    .limit(1)
  return row ?? null
}

// Versioned upsert: expire the current active row (set effective_until = now)
// and insert a new one at version+1, atomically. New policies start at v1.
export async function upsertPolicy(
  policyKey: string,
  policyType: PolicyType,
  policyValue: unknown,
  tenantId: string = TENANT_ID
): Promise<void> {
  await db.transaction(async (tx) => {
    const [current] = await tx
      .select()
      .from(memPolicies)
      .where(
        and(
          eq(memPolicies.tenantId, tenantId),
          eq(memPolicies.policyKey, policyKey),
          isNull(memPolicies.effectiveUntil)
        )
      )
      .limit(1)

    const nextVersion = current ? current.version + 1 : 1

    if (current) {
      await tx
        .update(memPolicies)
        .set({ effectiveUntil: sql`now()` })
        .where(eq(memPolicies.policyId, current.policyId))
    }

    await tx.insert(memPolicies).values({
      tenantId,
      policyType,
      policyKey,
      policyValue,
      version: nextVersion,
    })
  })
}
