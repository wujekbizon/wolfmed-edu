# Migration Guide: `new-courses` → `main`

**Date**: 2026-02-23
**Branch**: `new-courses` → `main`
**Scope**: Marketplace course model, Stripe per-course payments, Clerk metadata update, AI/RAG system

---

## Overview of Changes

### What Changed and Why

The platform is moving from a **single-subscription supporter model** to a **per-course marketplace model**.

| Area | `main` (current production) | `new-courses` (incoming) |
|------|-------------------------------|--------------------------|
| Access model | `user.supporter = true/false` | Per-course enrollment with tier (free/basic/premium/pro) |
| Stripe | One product, one price ID | Per-course pricing with basic + premium tiers |
| Clerk metadata | No course data in `publicMetadata` | `publicMetadata.ownedCourses: string[]` |
| Database | No `courses` or `courseEnrollments` tables | Both tables required |
| `payments` table | No `courseSlug` column | Has `courseSlug` column |
| `subscriptions` table | No `courseSlug` column | Has `courseSlug` column |
| Courses available | opiekun-medyczny (free/supporter) | opiekun-medyczny + pielegniarstwo (paid tiers) |
| AI / RAG | Not present | Gemini-based RAG with MCP server + SSE progress |

---

## Staging Environment (Neon Branch)

**Neon branch**: `br-dark-unit-a260opob`

This is a copy of the production database used for safe testing. Use it to validate schema changes and production code before touching the real DB.

| Property | Value |
|----------|-------|
| Branch ID | `br-dark-unit-a260opob` |
| Users | ❌ Missing (no real user data — not synced from main) |
| Tests | ✅ Populated manually (664 test records seeded) |
| Schema | Mirrors production at time of branch creation |

### What We Learned From Testing Here

1. **`db:push` is destructive on production** — Running `pnpm run db:push` against a DB that already has data in tables like `wolfmed_tests` will **truncate them** (Drizzle drops and recreates modified tables). All 664 test records would be lost.
2. **Do NOT use `db:push` on the main production DB.** Use the raw SQL statements in Section 2 instead.
3. This branch is safe for testing migrations, schema changes, and production code flows — but since it lacks real users, it cannot be used to validate user-specific flows end-to-end.

### To Switch `.env` to the Staging Branch

Swap `DATABASE_URL` to point to `br-dark-unit-a260opob` when testing locally against staging. Revert before any production operations.

---

## Pre-Merge Checklist

Before merging this PR, the following must be completed **in order**:

1. [x] Update Clerk webhook to initialise `ownedCourses: []` on registration (code change) ✓ Done
2. [ ] Run database migrations on production
3. [ ] Seed `courses` table
4. [x] Archive old Stripe products and create 4 new products/prices ✓ Done
5. [ ] Add all new environment variables, remove obsolete ones
6. [ ] ⚠️ Build + run `scripts/migrate-supporters.ts` — auto-enroll existing supporters → `opiekun-medyczny` basic tier
7. [ ] Verify webhook works end-to-end with a test purchase
8. [ ] Deploy and smoke-test access control
9. [ ] Address critical TODOs (RAG access gate)

---

## 1. Code Change — New User Registration ✅ Implemented

### What Was Done

The Clerk `user.created` webhook (`src/app/api/webhooks/clerk/route.ts`) previously inserted the user into the database but did **not** initialise `publicMetadata`, leaving `ownedCourses` as `undefined` for all new accounts.

`clerkClient` was added to the import and the following was added inside the `user.created` handler, immediately after `insertUserToDb`:

```ts
const clerk = await clerkClient()
await clerk.users.updateUser(id, {
  publicMetadata: { ownedCourses: [] },
})
```

Every new registration now starts with a clean `publicMetadata.ownedCourses: []` shape, consistent with what the Stripe webhook expects when appending purchased courses.

---

## 2. Database Migrations (Production)

> ⚠️ **CRITICAL — Do NOT run `pnpm run db:push` on production.**
> Drizzle's `db:push` will **truncate tables with schema changes** (e.g. `wolfmed_tests`) to recreate them, destroying all existing data. This was confirmed on the staging Neon branch (`br-dark-unit-a260opob`) where 664 test records would have been lost.
>
> **For main production DB: run only the SQL statements below, manually via Neon SQL editor or `psql`.**

### New Tables Required

Run the following SQL directly against the production DB. These tables do not yet exist so they are safe to create:

#### `wolfmed_courses`
```sql
CREATE TABLE wolfmed_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

#### `wolfmed_course_enrollments`
```sql
CREATE TABLE wolfmed_course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" VARCHAR(256) NOT NULL,
  course_slug VARCHAR(100) NOT NULL,
  access_tier VARCHAR(50) NOT NULL DEFAULT 'basic',
  is_active BOOLEAN NOT NULL DEFAULT true,
  enrolled_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP
);
```

#### `wolfmed_rag_config`
```sql
CREATE TABLE wolfmed_rag_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name TEXT NOT NULL UNIQUE,
  store_display_name TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Modified Tables

#### `wolfmed_stripe_payments` — new column
```sql
ALTER TABLE wolfmed_stripe_payments ADD COLUMN "courseSlug" VARCHAR(100);
```

#### `wolfmed_stripe_subscriptions` — new column
```sql
ALTER TABLE wolfmed_stripe_subscriptions ADD COLUMN "courseSlug" VARCHAR(100);
```

> Run the `ALTER TABLE` statements above manually. They are additive (new nullable column) and safe to run on a live production database without downtime or data loss.

---

## 3. Seed the `courses` Table

After migration, run the seed script:

```bash
pnpm run db:seed
```

This runs `scripts/seed-courses.ts` which:
- Checks if rows already exist — **safe to re-run, will not duplicate**
- Inserts `opiekun-medyczny` and `pielegniarstwo` if the table is empty

Alternatively, run the SQL directly in the Neon SQL editor:

```sql
INSERT INTO wolfmed_courses (slug, name, description, is_active)
VALUES
  ('opiekun-medyczny', 'Opiekun Medyczny', 'Program edukacyjny dla opiekunów medycznych', true),
  ('pielegniarstwo', 'Pielęgniarstwo', 'Program edukacyjny dla kierunku pielęgniarstwo', true);
```

---

## 4. Stripe Setup

> ⏸️ **DEFERRED — Do not complete this step until final prices are confirmed.**
>
> Product names and tiers are defined, but PLN amounts are not finalised yet. Creating products now with placeholder prices would require editing or recreating them later. Come back to this section once pricing is locked in.
> Images can also be skipped during creation and added later at any time.

### Step 1 — Archive the Old Products

Before creating new products, archive the existing ones to avoid confusion and stale price IDs in the codebase.

In the [Stripe Dashboard](https://dashboard.stripe.com) → **Products**:

1. Find the old single-subscription/supporter products (currently referenced by `STRIPE_PRICE_ID` and `STRIPE_BASIC_PRICE_ID`)
2. Open each product → click **Archive** (this disables new purchases but preserves historical payment data)
3. Do **not** delete them — Stripe does not allow deletion of products with existing charges

### Step 2 — Create 4 New Products and Prices

Create the following as **one-time payment** prices (mode: `payment`, not subscription):

| Product Name | Tier | Currency | Notes |
|---|---|---|---|
| Opiekun Medyczny Standard | basic | PLN | Basic access to opiekun-medyczny course |
| Opiekun Medyczny Premium | premium | PLN | Premium access to opiekun-medyczny course |
| Pielęgniarstwo Basic | basic | PLN | Basic access to pielegniarstwo course |
| Pielęgniarstwo Premium | premium | PLN | Premium access to pielegniarstwo course |

After creating each price, copy the `price_xxx` ID into the corresponding env variable (see Section 5).

### Step 3 — Remove Old Products (Post-Migration)

Once the migration is fully live and no active subscriptions or refund windows remain on the old products:

1. Go to Stripe Dashboard → **Products**
2. Confirm the archived products have zero active subscribers and no pending charges
3. Archive status already prevents new purchases — but if Stripe allows deletion at that point, you can delete them for a clean dashboard

> **Note**: Stripe does not allow deleting products that have any associated charges or subscriptions (even historical ones). If deletion is blocked, leaving them archived is sufficient. Remove `STRIPE_PRICE_ID` and `STRIPE_BASIC_PRICE_ID` from your environment variables (see Section 5) once you are confident no code paths reference them.

### Webhook Configuration

Ensure the Stripe webhook is configured to send **at minimum** these events to `/api/webhooks/stripe`:

- `checkout.session.completed`
- `charge.succeeded`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

The `checkout.session.completed` handler reads `metadata.courseSlug` and `metadata.accessTier` from the session to enroll the user. **If these fields are missing, enrollment will be silently skipped** — always verify your checkout session creation passes them.

---

## 5. Environment Variables

### New Variables — Add to Production

```env
# Stripe — per-course price IDs (from the 4 new products created above)
NEXT_PUBLIC_STRIPE_OPIEKUN_STANDARD_PRICE_ID=price_xxx
NEXT_PUBLIC_STRIPE_OPIEKUN_PREMIUM_PRICE_ID=price_xxx
NEXT_PUBLIC_STRIPE_PIELEGNIARSTWO_BASIC_PRICE_ID=price_xxx
NEXT_PUBLIC_STRIPE_PIELEGNIARSTWO_PREMIUM_PRICE_ID=price_xxx

# Google AI (Gemini) — required for RAG feature
GOOGLE_API_KEY=AIza...

# Upstash Redis — required for RAG progress SSE
# Falls back to in-memory if not set (not suitable for multi-instance production)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
```

### Existing Variables — Keep

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
DATABASE_URL=
NEXT_PUBLIC_APP_URL=
```

### Old Variables — Remove After Migration

Once the old Stripe products are archived and all traffic is on the new flow, remove these:

```env
# Old single-product Stripe IDs — no longer used
STRIPE_PRICE_ID=
STRIPE_BASIC_PRICE_ID=
```

---

## 6. Existing User Migration (opiekun-medyczny buyers)

> 🔧 **TODO: `scripts/migrate-supporters.ts` must be created before this step can run.**
>
> The script template below is complete — it needs to be implemented as an actual file (mirroring how `scripts/seed-courses.ts` was built) and run once against production. It queries all users where `supporter = true` and automatically:
> 1. Creates a `wolfmed_course_enrollments` row for `opiekun-medyczny` / `basic`
> 2. Patches Clerk `publicMetadata.ownedCourses` to include `opiekun-medyczny`
>
> This ensures no existing supporter loses access after the platform model changes.

Users who previously paid via the old supporter model have `user.supporter = true` in the database but **no `courseEnrollments` record** and **no `ownedCourses` in Clerk metadata**. Without this migration they will lose access after the merge.

**Tier assigned**: `basic` (existing supporters map to the basic tier in the new system)

### Option A — Automated Script (Required)

Create a one-time migration script (e.g. `scripts/migrate-supporters.ts`) and run it once against production:

```ts
import 'dotenv/config'
import { db } from '@/server/db'
import { users } from '@/server/db/schema'
import { eq } from 'drizzle-orm'
import { clerkClient } from '@clerk/nextjs/server'

async function migrateSupporters() {
  // 1. Fetch all supporter users
  const supporters = await db
    .select({ userId: users.userId })
    .from(users)
    .where(eq(users.supporter, true))

  console.log(`Found ${supporters.length} supporter(s) to migrate`)

  const clerk = await clerkClient()

  for (const { userId } of supporters) {
    try {
      // 2. Insert courseEnrollment record
      await db.execute(`
        INSERT INTO wolfmed_course_enrollments ("userId", course_slug, access_tier, is_active, enrolled_at)
        VALUES ('${userId}', 'opiekun-medyczny', 'basic', true, NOW())
        ON CONFLICT DO NOTHING
      `)

      // 3. Update Clerk publicMetadata — merge, do not overwrite
      const user = await clerk.users.getUser(userId)
      const currentCourses = (user.publicMetadata?.ownedCourses as string[]) || []

      if (!currentCourses.includes('opiekun-medyczny')) {
        await clerk.users.updateUser(userId, {
          publicMetadata: {
            ...user.publicMetadata,
            ownedCourses: [...currentCourses, 'opiekun-medyczny'],
          },
        })
      }

      console.log(`✓ Migrated ${userId}`)
    } catch (err) {
      console.error(`✗ Failed for ${userId}:`, err)
    }
  }

  console.log('Migration complete')
  process.exit(0)
}

migrateSupporters()
```

Run with:
```bash
npx tsx scripts/migrate-supporters.ts
```

### Option B — Manual SQL + Clerk API

If running a script isn't feasible, do the following manually:

**Step 1 — Bulk insert enrollments**

```sql
INSERT INTO wolfmed_course_enrollments ("userId", course_slug, access_tier, is_active, enrolled_at)
SELECT "userId", 'opiekun-medyczny', 'basic', true, NOW()
FROM wolfmed_users
WHERE supporter = true
ON CONFLICT DO NOTHING;
```

**Step 2 — Update Clerk metadata per user**

For each `userId` returned by `SELECT "userId" FROM wolfmed_users WHERE supporter = true`:

```bash
# Replace <USER_ID> and <CLERK_SECRET_KEY>
curl -X PATCH https://api.clerk.com/v1/users/<USER_ID> \
  -H "Authorization: Bearer <CLERK_SECRET_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "public_metadata": {
      "ownedCourses": ["opiekun-medyczny"]
    }
  }'
```

> **Important**: Always fetch the user's existing `publicMetadata` first and merge — do not blindly overwrite other fields if any exist.

### Step 3 — Verify Migration

```sql
-- Should return a row for every migrated supporter
SELECT u."userId", u.supporter, e.course_slug, e.access_tier, e.is_active
FROM wolfmed_users u
LEFT JOIN wolfmed_course_enrollments e ON u."userId" = e."userId"
WHERE u.supporter = true;
```

Then spot-check a few accounts in the Clerk Dashboard to confirm `publicMetadata.ownedCourses: ["opiekun-medyczny"]` is set.

---

## 7. Access Control Logic (How it Works Post-Merge)

### Two-Level Check

1. **Course enrollment** — Is the user enrolled in this course at all?
   - Checks `courseEnrollments` table (`isActive: true`)
   - Fast-path check via Clerk `publicMetadata.ownedCourses`
   - Database is the source of truth

2. **Tier access** — Does the user's tier meet the category requirement?
   - Each category in `CATEGORY_METADATA` has a `requiredTier` field
   - Hierarchy: `free (0) < basic (1) < premium (2) < pro (3)`

### Where Access is Checked

| Page | File | What it checks |
|------|------|----------------|
| `/panel/nauka` | `src/app/panel/nauka/page.tsx` | Per-category via `checkCourseAccessAction` + `hasAccessToTier` |
| `/panel/kursy` | `src/app/panel/kursy/page.tsx` | Enrolled courses list |
| `/panel/kursy/[categoryId]` | `src/app/panel/kursy/[categoryId]/page.tsx` | Full access + tier check before showing category |
| Category cards | `src/components/kursy/CategoryCard.tsx` | Shows locked state if tier insufficient |

---

## 8. RAG / AI Feature

### Current Status

The RAG system (Gemini + MCP + SSE progress) is implemented and functional for:
- Asking questions against course documentation via RAG cells in the notebook
- MCP server serving `/docs` markdown files as resources
- SSE real-time progress feedback during RAG queries
- `@resource` and `/tool` command autocomplete in RAG cells

### What Is NOT Yet Complete

| Item | Status | File |
|------|--------|------|
| Multi-turn tool execution (Gemini calls `/utworz`, `/podsumuj`, etc.) | Planned, not implemented | `src/server/google-rag.ts` |
| Tool executor handler (`/flashcards`, `/quiz`, `/tlumacz`) | Partially implemented | `src/server/tools/executor.ts` |
| RAG cell persistence (save/load responses) | Not implemented | Planned |

### RAG Access Gate — Implementation Plan

> The RAG notebook feature is currently **not gated by course tier**. Any authenticated user can access RAG cells.

**Required before production**: RAG cells (and the AI notebook panel) must only be accessible to users with `premium` tier on either `opiekun-medyczny` or `pielegniarstwo`.

**Deployment strategy**: Launch basic and premium together (Option A). Both tiers go live at the same time — basic users get tests/content, premium users get RAG/AI on top.

**What "premium" means**: Active enrollment on **either** course with `accessTier >= premium`. Clerk `publicMetadata.ownedCourses` is used as a fast-path (does the user own the course at all?); the DB `courseEnrollments.accessTier` is the source of truth for the tier level.

#### Three-Layer Implementation (5 files, no schema changes)

**Layer 1 — Shared helper** · `src/actions/course-actions.ts`

Add `checkPremiumAccessAction()` — calls `checkCourseAccessAction` for both courses in parallel, returns `true` if either has `accessTier >= premium`:

```ts
export async function checkPremiumAccessAction(): Promise<boolean> {
  const [opiekun, pielegniarstwo] = await Promise.all([
    checkCourseAccessAction('opiekun-medyczny'),
    checkCourseAccessAction('pielegniarstwo'),
  ])
  return (
    (opiekun.hasAccess && hasAccessToTier(opiekun.accessTier ?? 'free', 'premium')) ||
    (pielegniarstwo.hasAccess && hasAccessToTier(pielegniarstwo.accessTier ?? 'free', 'premium'))
  )
}
```

**Layer 2 — Server action gate** · `src/actions/rag-actions.ts`

At the very top of `askRagQuestion`, before any processing:

```ts
const isPremium = await checkPremiumAccessAction()
if (!isPremium) {
  return toFormState('ERROR', 'Funkcja dostępna tylko dla użytkowników premium.')
}
```

This is the hard security gate — even if the UI is bypassed, the action refuses.

**Layer 3 — Page + UI gate** · 3 files

| File | Change |
|------|--------|
| `src/app/panel/nauka/page.tsx` | Replace `isSupporter={user.supporter}` with `isPremium={await checkPremiumAccessAction()}` |
| `src/components/LearningHubDashboard.tsx` | Rename prop `isSupporter` → `isPremium`; update `PremiumLock` href from `/wsparcie-projektu` to `/kursy` |
| `src/components/PremiumLock.tsx` | Update link text/destination to point to the upgrade/pricing page |

`CellList` (RAG notebook) and `NotesSection` remain behind the `!isPremium` overlay — same visual pattern, condition changes from old supporter boolean to new tier check.

### RAG Environment Requirements

```env
GOOGLE_API_KEY=          # Gemini API access
UPSTASH_REDIS_REST_URL=  # SSE progress state storage
UPSTASH_REDIS_REST_TOKEN=
```

Without Redis, the SSE progress system falls back to in-memory (fine for single-instance dev, not suitable for production multi-instance deployments).

---

## 9. What Is Still Missing Before Full Production Readiness

| Priority | Item | Notes |
|----------|------|-------|
| ✅ Done | Clerk webhook — initialise `ownedCourses: []` on registration | Section 1 |
| ✅ Done | Archive old Stripe products + create 4 new products/prices | Section 4 |
| 🟠 Post-migration | Delete old Stripe products (after all active subscriptions/charges settle) | Section 4 |
| 🔴 Critical | RAG access gate (premium tier only) | Section 8 |
| 🔴 Critical | Build `scripts/migrate-supporters.ts` + run on production | Section 6 — auto-enroll all `supporter = true` users into `opiekun-medyczny` basic |
| 🔴 Critical | Stripe webhook `metadata` validation | Ensure `courseSlug` is always present in checkout sessions |
| 🟡 Important | Multi-turn tool execution | `/flashcards`, `/podsumuj`, etc. — core AI feature |
| 🟡 Important | RAG cell response persistence | Save responses to DB so they reload on page refresh |
| 🟡 Important | `pro` tier pricing structure | Currently only `basic` and `premium` defined — is `pro` planned? |
| 🟠 Nice to have | Subscription cancellation handling | `customer.subscription.deleted` webhook handler is a stub |
| 🟠 Nice to have | Tier upgrade flow | User buys premium after basic — enrollment updates but UI path isn't tested |

---

## 10. Post-Deploy Verification

After deploying to production:

1. **Test a new registration**
   - Create a fresh account
   - Confirm Clerk `publicMetadata.ownedCourses` is `[]` (not `undefined`)

2. **Test a new purchase end-to-end**
   - Buy a course with a real or test Stripe card
   - Confirm `courseEnrollments` record created in DB
   - Confirm `ownedCourses` in Clerk metadata updated to include the purchased course
   - Confirm `/panel/kursy` shows the purchased course

3. **Test an existing supporter account**
   - Log in with an account that had `supporter: true` before migration
   - Confirm `/panel/kursy` shows `opiekun-medyczny` with `basic` access
   - Confirm they can access categories with `requiredTier: "basic"` or lower

4. **Test access denial**
   - Use an account with no enrollments
   - Confirm `/panel/kursy` shows empty state (not an error)
   - Confirm navigating directly to `/panel/kursy/[category]` shows `NoAccessMessage`

5. **Test tier gating**
   - Use a `basic` tier account
   - Confirm categories with `requiredTier: "premium"` show locked state in `CategoryCard`
   - Confirm direct URL access to a premium category shows `TierUpgradeMessage`

6. **Verify webhook signature**
   - Check Stripe Dashboard → Webhooks → recent events
   - Confirm `checkout.session.completed` shows `200 OK` response

---

## 11. Key Files Reference

| Category | File | Purpose |
|----------|------|---------|
| DB Schema | `src/server/db/schema.ts` | All table definitions including new `courses`, `courseEnrollments`, `ragConfig` |
| Clerk webhook | `src/app/api/webhooks/clerk/route.ts` | `user.created` — must initialise `ownedCourses: []` |
| Course actions | `src/actions/course-actions.ts` | `checkCourseAccessAction`, `enrollUserAction`, `getUserEnrollmentsAction` |
| Stripe checkout | `src/actions/stripe.ts` | Creates checkout session with `courseSlug` + `accessTier` in metadata |
| Stripe webhook | `src/app/api/webhooks/stripe/route.ts` | Handles `checkout.session.completed` → enrolls user + updates Clerk |
| Access tiers | `src/helpers/accessTiers.ts` | `TIER_HIERARCHY` + `hasAccessToTier()` |
| Course pricing | `src/constants/careerPathsData.ts` | Per-course pricing config with Stripe price IDs |
| Category config | `src/constants/categoryMetadata.ts` | Maps each category to a course + `requiredTier` |
| RAG system | `src/server/google-rag.ts` | Gemini RAG query handler |
| MCP server | `src/server/mcp/server.ts` | MCP server serving `/docs` resources |
| RAG progress | `src/server/progress-store.ts` | Redis-backed SSE progress state |
| Kursy page | `src/app/panel/kursy/page.tsx` | User's enrolled courses list |
| Category detail | `src/app/panel/kursy/[categoryId]/page.tsx` | Per-category access gating + test entry |
