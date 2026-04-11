# AI Credits System — Implementation Plan
**Date**: 2026-04-10
**Status**: Planned — not yet implemented
**Replaces**: time-based rate limits for `rag:query` and `lecture:generate`

---

## Overview

Replace the current per-hour/per-day rate limits for AI features with a **lifetime credit system** per user. Each course purchase grants a fixed credit allocation. Users can purchase additional credits via Stripe one-time payments.

---

## Database Schema

### New table: `userAiCredits`

```typescript
// src/server/schema.ts — add this table

export const userAiCredits = pgTable('user_ai_credits', {
  id:           uuid('id').defaultRandom().primaryKey(),
  userId:       text('user_id').notNull(),
  feature:      text('feature').notNull(),         // 'ai_query' | 'lecture'
  included:     integer('included').notNull().default(0),   // granted at purchase
  purchased:    integer('purchased').notNull().default(0),  // bought as topup
  used:         integer('used').notNull().default(0),
  createdAt:    timestamp('created_at').defaultNow().notNull(),
  updatedAt:    timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userFeatureIdx: uniqueIndex('user_feature_idx').on(table.userId, table.feature),
}))
```

**Features tracked:**

| `feature` value | Covers | Opiekun initial | Pielęgniarstwo initial |
|----------------|--------|-----------------|------------------------|
| `ai_query` | RAG queries + tool requests | 1,000 | 1,000 |
| `lecture` | TTS lecture generation | 0 | 25 |

---

## Credit Check Logic

### New query: `src/server/queries.ts`

```typescript
export async function getAiCredits(userId: string, feature: string) {
  const row = await db
    .select()
    .from(userAiCredits)
    .where(and(eq(userAiCredits.userId, userId), eq(userAiCredits.feature, feature)))
    .then(r => r[0])

  if (!row) return { available: 0, used: 0, total: 0 }

  return {
    available: (row.included + row.purchased) - row.used,
    used: row.used,
    total: row.included + row.purchased,
  }
}

export async function consumeAiCredit(userId: string, feature: string): Promise<boolean> {
  const credits = await getAiCredits(userId, feature)
  if (credits.available <= 0) return false

  await db
    .update(userAiCredits)
    .set({
      used: sql`${userAiCredits.used} + 1`,
      updatedAt: new Date(),
    })
    .where(and(eq(userAiCredits.userId, userId), eq(userAiCredits.feature, feature)))

  return true
}

export async function grantAiCredits(
  userId: string,
  feature: string,
  amount: number,
  type: 'included' | 'purchased'
) {
  await db
    .insert(userAiCredits)
    .values({ userId, feature, [type]: amount })
    .onConflictDoUpdate({
      target: [userAiCredits.userId, userAiCredits.feature],
      set: {
        [type]: sql`${userAiCredits[type]} + ${amount}`,
        updatedAt: new Date(),
      },
    })
}
```

---

## Integration Points

### 1. Grant credits on course purchase

**File**: `src/actions/stripe-actions.ts` (or wherever the Stripe webhook is handled)

After a successful course purchase, call `grantAiCredits` based on course:

```typescript
// Stripe webhook handler — checkout.session.completed
const courseCredits: Record<string, { feature: string; amount: number }[]> = {
  'opiekun-medyczny': [
    { feature: 'ai_query', amount: 1000 },
  ],
  'pielegniarstwo': [
    { feature: 'ai_query', amount: 1000 },
    { feature: 'lecture', amount: 25 },
  ],
}

for (const { feature, amount } of courseCredits[courseId] ?? []) {
  await grantAiCredits(userId, feature, amount, 'included')
}
```

---

### 2. Replace rate limit checks in `rag-actions.ts`

**File**: `src/actions/rag-actions.ts`

```typescript
// REMOVE:
const rateLimit = await checkRateLimit(userId, 'rag:query')
if (!rateLimit.success) { ... }

// REPLACE WITH:
const granted = await consumeAiCredit(userId, 'ai_query')
if (!granted) {
  if (jobId) await errorJob(jobId, 'Brak kredytów AI')
  return toFormState('ERROR', 'Wykorzystałeś wszystkie kredyty AI. Doładuj konto w ustawieniach.')
}
```

Same pattern for `lecture:generate` → check `lecture` feature credit.

---

### 3. Topup purchase flow (Stripe)

**New Stripe products** (one-time payments):

| Product | Price | Credits granted |
|---------|-------|-----------------|
| `topup-lecture-5` | 19.99 PLN | `lecture` +5 |
| `topup-lecture-10` | 34.99 PLN | `lecture` +10 |
| `topup-lecture-20` | 59.99 PLN | `lecture` +20 |
| `topup-query-500` | 14.99 PLN | `ai_query` +500 |

**Webhook handler** (`checkout.session.completed`):
```typescript
const topupMap: Record<string, { feature: string; amount: number }> = {
  'topup-lecture-5':  { feature: 'lecture', amount: 5 },
  'topup-lecture-10': { feature: 'lecture', amount: 10 },
  'topup-lecture-20': { feature: 'lecture', amount: 20 },
  'topup-query-500':  { feature: 'ai_query', amount: 500 },
}

const topup = topupMap[productId]
if (topup) {
  await grantAiCredits(userId, topup.feature, topup.amount, 'purchased')
}
```

---

### 4. UI — show credit balance

Display remaining credits in the AI panel so users know where they stand.

**Where**: `src/app/panel/nauka/page.tsx` — fetch credits alongside `isPremium`

```typescript
const [isPremium, aiQueryCredits, lectureCredits] = await Promise.all([
  checkPremiumAccessAction(),
  getAiCredits(userId, 'ai_query'),
  getAiCredits(userId, 'lecture'),
])
```

Pass down to `RagCell` / `AddCell` — show e.g. `"Kredyty AI: 847 / 1000"` and `"Wykłady: 23 / 25"`.

---

## Migration — existing users

When the system is deployed, existing premium users with no credits row should be granted their initial allocation automatically (one-time migration script or on first use via upsert).

```typescript
// src/scripts/migrate-credits.ts
// Run once after deploying the new table
for (const user of existingPremiumUsers) {
  await grantAiCredits(user.id, 'ai_query', 1000, 'included')
  if (user.course === 'pielegniarstwo') {
    await grantAiCredits(user.id, 'lecture', 25, 'included')
  }
}
```

---

## What to keep from current rate limits

The existing `rateLimit.ts` buckets for non-AI actions (`note:create`, `forum:post:create`, etc.) stay as-is. Only `rag:query` and `lecture:generate` are replaced by the credit system.

---

## Implementation Order

1. [ ] Add `userAiCredits` table to schema → `pnpm run db:push`
2. [ ] Add `getAiCredits`, `consumeAiCredit`, `grantAiCredits` to `src/server/queries.ts`
3. [ ] Wire `grantAiCredits` into Stripe webhook on course purchase
4. [ ] Replace `checkRateLimit('rag:query')` in `rag-actions.ts` with `consumeAiCredit`
5. [ ] Replace `checkRateLimit('lecture:generate')` in `rag-actions.ts` with `consumeAiCredit`
6. [ ] Add Stripe topup products + webhook handler
7. [ ] Add credit balance UI to AI panel
8. [ ] Run migration for existing users
