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

## Pre-Merge Checklist

Before merging this PR, the following must be completed in order:

1. [ ] Run database migrations
2. [ ] Seed `courses` table
3. [ ] Create Stripe products and prices
4. [ ] Add all new environment variables
5. [ ] Migrate existing opiekun-medyczny users (DB enrollment + Clerk metadata)
6. [ ] Verify webhook works end-to-end with a test purchase
7. [ ] Deploy and smoke test access control
8. [ ] Address critical TODOs (RAG access gate)

---

## 1. Database Migrations

### New Tables Required

Run `pnpm run db:push` after merging the schema. The following new tables will be created:

#### `wolfmed_courses`
```sql
-- Seed this table after creation (see Section 2)
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

> **Note**: Drizzle will handle all of the above via `pnpm run db:push`. Review the diff carefully before applying to production.
---

## 2. Seed the `courses` Table

After migration, insert the two active courses:

```sql
INSERT INTO wolfmed_courses (slug, name, description, is_active)
VALUES
  ('opiekun-medyczny', 'Opiekun Medyczny', 'Program edukacyjny dla opiekunów medycznych', true),
  ('pielegniarstwo', 'Pielęgniarstwo', 'Program edukacyjny dla kierunku pielęgniarstwo', true);
```

---

## 3. Stripe Setup

### Create 4 New Products and Prices

Go to [Stripe Dashboard](https://dashboard.stripe.com) and create the following one-time payment prices (mode: `payment`, not subscription):

| Product | Tier | Currency | Description |
|---------|------|----------|-------------|
| Opiekun Medyczny Standard | basic | PLN | Basic access to opiekun-medyczny course |
| Opiekun Medyczny Premium | premium | PLN | Premium access to opiekun-medyczny course |
| Pielęgniarstwo Basic | basic | PLN | Basic access to pielegniarstwo course |
| Pielęgniarstwo Premium | premium | PLN | Premium access to pielegniarstwo course |

After creating each price, copy the `price_xxx` ID into the corresponding env variable (see Section 4).

### Webhook Configuration

Ensure the Stripe webhook is configured to send **at minimum** the following events to `/api/webhooks/stripe`:

- `checkout.session.completed`
- `charge.succeeded`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

The `checkout.session.completed` handler now reads `metadata.courseSlug` and `metadata.accessTier` from the session to enroll the user. **If these fields are missing, enrollment will be silently skipped** — verify your checkout session creation always passes them.

---

## 4. Environment Variables

### New Variables Required

Add these to your production `.env` (and `.env.local` for development):

```env
# Stripe — per-course price IDs
NEXT_PUBLIC_STRIPE_OPIEKUN_STANDARD_PRICE_ID=price_xxx
NEXT_PUBLIC_STRIPE_OPIEKUN_PREMIUM_PRICE_ID=price_xxx
NEXT_PUBLIC_STRIPE_PIELEGNIARSTWO_BASIC_PRICE_ID=price_xxx
NEXT_PUBLIC_STRIPE_PIELEGNIARSTWO_PREMIUM_PRICE_ID=price_xxx
# Google AI (Gemini) — required for RAG feature
GOOGLE_API_KEY=AIza...
# Upstash Redis — required for RAG progress SSE
# Falls back to in-memory if not set (not suitable for production)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
```

### Existing Variables Still Required

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
DATABASE_URL=
NEXT_PUBLIC_APP_URL=
```

### Variables That Can Be Removed After Migration

```env
# Old single-product Stripe IDs (no longer used in new-courses)
STRIPE_PRICE_ID=
STRIPE_BASIC_PRICE_ID=
```

---

## 5. Existing User Migration (opiekun-medyczny buyers)

Users who previously paid via the old supporter model have `user.supporter = true` in the database but **no `courseEnrollments` record** and **no `ownedCourses` in Clerk metadata**. Without this migration they will lose access after the merge.

**Tier assigned**: `basic` (existing supporters map to the basic tier in the new system)

### Step 1 — Find All Existing Supporters

Query your production database to get all current supporter user IDs:

```sql
SELECT "userId" FROM wolfmed_users WHERE supporter = true;
```

### Step 2 — Create `courseEnrollments` Records

For each `userId` returned, insert an enrollment:

```sql
INSERT INTO wolfmed_course_enrollments ("userId", course_slug, access_tier, is_active, enrolled_at)
VALUES
  ('<userId>', 'opiekun-medyczny', 'basic', true, NOW())
ON CONFLICT DO NOTHING;
```

Or as a single bulk insert:

```sql
INSERT INTO wolfmed_course_enrollments ("userId", course_slug, access_tier, is_active, enrolled_at)
SELECT "userId", 'opiekun-medyczny', 'basic', true, NOW()
FROM wolfmed_users
WHERE supporter = true
ON CONFLICT DO NOTHING;
```

### Step 3 — Update Clerk `publicMetadata` for Each User

For each supporter `userId`, call the Clerk Backend API to add `ownedCourses`:

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

> **Important**: If a user already has other fields in `publicMetadata`, you must first fetch the existing metadata and merge — do not overwrite it blindly. The webhook handler in `new-courses` already does this correctly (`{ ...user.publicMetadata, ownedCourses: [...] }`).
### Step 4 — Verify

After running the migration, pick a few supporter users and confirm:

```sql
-- Should return rows for each migrated user
SELECT * FROM wolfmed_course_enrollments
WHERE course_slug = 'opiekun-medyczny'
LIMIT 10;
```

And verify their Clerk profile shows `publicMetadata.ownedCourses: ["opiekun-medyczny"]` in the Clerk dashboard.

---

## 6. Access Control Logic (How it Works Post-Merge)

Understanding this is critical before deploying:

### Two-Level Check

1. **Course enrollment** — Is the user enrolled in this course at all?
   - Checks `courseEnrollments` table (`isActive: true`)
   - Fast-path check via Clerk `publicMetadata.ownedCourses`
   - Database is the source of truth

2. **Tier access** — Does the user's tier meet the category requirement?
   - Each category in `CATEGORY_METADATA` has a `requiredTier` field
   - User's enrollment has an `accessTier` field
   - Hierarchy: `free (0) < basic (1) < premium (2) < pro (3)`

### Where Access is Checked

| Page | File | What it checks |
|------|------|----------------|
| `/panel/nauka` | `src/app/panel/nauka/page.tsx` | Per-category via `checkCourseAccessAction` + `hasAccessToTier` |
| `/panel/kursy` | `src/app/panel/kursy/page.tsx` | Enrolled courses list |
| `/panel/kursy/[categoryId]` | `src/app/panel/kursy/[categoryId]/page.tsx` | Full access + tier check before showing category |
| Category cards | `src/components/kursy/CategoryCard.tsx` | Shows locked state if tier insufficient |

---

## 7. RAG / AI Feature

### Current Status

The RAG system (Gemini + MCP + SSE progress) is implemented and functional for:
- Asking questions against course documentation via RAG cells in the notebook
- MCP server serving `/docs` markdown files as resources
- SSE real-time progress feedback during RAG queries
- `@resource` and `/tool` command autocomplete in RAG cells

### What Is NOT Yet Complete

The following items are **in-progress** and should be resolved before or shortly after merging:

| Item | Status | File |
|------|--------|------|
| Multi-turn tool execution (Gemini calls `/utworz`, `/podsumuj`, etc.) | Planned, not implemented | `src/server/google-rag.ts` |
| Tool executor handler (`/flashcards`, `/quiz`, `/tlumacz`) | Partially implemented | `src/server/tools/executor.ts` |
| RAG cell persistence (save/load responses) | Not implemented | Planned |

### **CRITICAL TODO: RAG Access Gate**

> The RAG notebook feature is currently **not gated by course tier**. Any authenticated user can access RAG cells.
**Required before production**: RAG cells (and the AI notebook panel) must only be accessible to users with `premium` tier on either `opiekun-medyczny` or `pielegniarstwo`.

The access check should:
1. Call `checkCourseAccessAction('opiekun-medyczny')` and `checkCourseAccessAction('pielegniarstwo')`
2. Check if either enrollment has `accessTier === 'premium'` (or higher)
3. If neither: hide the RAG panel or show a locked/upgrade prompt

The `hasAccessToTier` helper in `src/helpers/accessTiers.ts` is already set up for this check.

### RAG Environment Requirements

The RAG feature requires all three of these to be configured:

```env
GOOGLE_API_KEY=          # Gemini API access
UPSTASH_REDIS_REST_URL=  # SSE progress state storage
UPSTASH_REDIS_REST_TOKEN=
```

Without Redis, the SSE progress system falls back to in-memory (fine for single-instance dev, not suitable for production multi-instance deployments).

---

## 8. What Is Still Missing Before Full Production Readiness

Beyond the migration steps above, the following items remain open:

| Priority | Item | Notes |
|----------|------|-------|
| 🔴 Critical | RAG access gate (premium tier only) | Described in Section 7 |
| 🔴 Critical | Stripe webhook `metadata` validation | Ensure `courseSlug` is always present in checkout sessions |
| 🟡 Important | Multi-turn tool execution | `/criar`, `/podsumuj`, etc. — core AI feature |
| 🟡 Important | RAG cell response persistence | Save responses to DB so they reload on page refresh |
| 🟡 Important | `pro` tier pricing structure | Currently only `basic` and `premium` defined — is `pro` planned? |
| 🟠 Nice to have | Migration script for existing users | Currently manual; a one-time script would reduce risk of missed users |
| 🟠 Nice to have | Subscription cancellation handling | `customer.subscription.deleted` webhook handler is a stub |
| 🟠 Nice to have | Tier upgrade flow | User buys premium after basic — enrollment updates but UI path isn't tested |

---

## 9. Post-Deploy Verification

After deploying to production:

1. **Test a new purchase end-to-end**
   - Buy a course with a real or test Stripe card
   - Confirm `courseEnrollments` record created
   - Confirm `ownedCourses` in Clerk metadata updated
   - Confirm `/panel/kursy` shows the purchased course

2. **Test an existing supporter account**
   - Log in with an account that had `supporter: true` before migration
   - Confirm `/panel/kursy` shows `opiekun-medyczny` with `basic` access
   - Confirm they can access categories with `requiredTier: "basic"` or lower

3. **Test access denial**
   - Use an account with no enrollments
   - Confirm `/panel/kursy` shows empty state (not an error)
   - Confirm navigating directly to `/panel/kursy/[category]` shows `NoAccessMessage`

4. **Test tier gating**
   - Use a `basic` tier account
   - Confirm categories with `requiredTier: "premium"` show locked state in `CategoryCard`
   - Confirm direct URL access to a premium category shows `TierUpgradeMessage`

5. **Verify webhook signature**
   - Check Stripe Dashboard → Webhooks → recent events
   - Confirm `checkout.session.completed` shows `200 OK` response

---

## 10. Key Files Reference

| Category | File | Purpose |
|----------|------|---------|
| DB Schema | `src/server/db/schema.ts` | All table definitions including new `courses`, `courseEnrollments`, `ragConfig` |
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