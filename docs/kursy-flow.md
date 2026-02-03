# /panel/kursy Flow Documentation

## Purpose
The `/panel/kursy` page displays courses the user is enrolled in and their accessible categories with tier-based access control.

## Access Control Architecture

### Two-Level Access System

1. **Course Enrollment Check**
   - User must have an active enrollment in the `courseEnrollments` table
   - Checks `isActive: true` in database
   - Fallback checks Clerk `publicMetadata.ownedCourses` for performance

2. **Tier Access Check**
   - Each category has a `requiredTier` field (free/basic/premium/pro)
   - User's course enrollment has an `accessTier` field
   - Tier hierarchy: `free < basic < premium < pro`
   - Access granted if `userTier >= requiredTier`

## Page Flow

### `/panel/kursy/page.tsx`
1. Fetch user with `getCurrentUser()`
2. Fetch enrolled courses with `getUserEnrolledCourses(userId)`
3. Pass courses to `EnrolledCoursesList` component

### `EnrolledCoursesList` Component
1. Map each course to its categories from `CATEGORY_METADATA`
2. For each category, check tier access using `hasAccessToTier()`
3. Render with `CategoryCard` component, passing `userTier`

### `CategoryCard` Component
**Locked State** (insufficient tier):
- Grayed out (opacity-50)
- 🔒 icon displayed
- Shows "Wymagana: {tier}" text
- Non-clickable (`div` instead of `Link`)
- Grayscale filter on image

**Accessible State**:
- Normal colors and hover effects
- Clickable link to `/panel/kursy/[categoryId]`
- Shows category image and popularity

## Category Detail Page Flow

### `/panel/kursy/[categoryId]/page.tsx`
1. Get category metadata from `CATEGORY_METADATA[categoryId]`
2. Check course enrollment with `checkCourseAccessAction(category.course)`
3. If not enrolled: show "Brak dostępu" screen
4. If enrolled, check tier access with `hasAccessToTier()`
5. If insufficient tier: show "🔒 Wymagana wyższa wersja" screen
6. If access granted: show category overview + CTA button "Rozpocznij Egzamin"

**What Category Detail Shows**:
- ✅ Category metadata (image, description, stats)
- ✅ Test count and duration options
- ✅ CTA button linking to `/panel/testy/[category]?sessionId=new`
- ❌ No test preview/listing
- ❌ No progress tracking

## Tier Hierarchy

```typescript
TIER_HIERARCHY = {
  free: 0,
  basic: 1,
  premium: 2,
  pro: 3
}
```

**Access Logic**:
```typescript
hasAccessToTier(userTier, requiredTier) {
  return TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[requiredTier]
}
```

## Key Files

| File | Purpose |
|------|---------|
| `/src/app/panel/kursy/page.tsx` | Main courses listing page |
| `/src/components/EnrolledCoursesList.tsx` | Renders course cards with categories |
| `/src/components/kursy/CategoryCard.tsx` | Individual category card with tier checking |
| `/src/app/panel/kursy/[categoryId]/page.tsx` | Category detail with access control |
| `/src/constants/categoryMetadata.ts` | Source of truth for category config + tiers |
| `/src/lib/accessTiers.ts` | Tier hierarchy logic |
| `/src/actions/course-actions.ts` | Course enrollment checks |

## Data Sources

**Course Enrollment**:
- Database: `courseEnrollments` table
- Fields: `userId`, `courseSlug`, `accessTier`, `isActive`, `enrolledAt`

**Category Metadata**:
- TypeScript constant: `CATEGORY_METADATA`
- Fields include: `category`, `course`, `requiredTier`, `image`, `description`, etc.

**Quick Access Check**:
- Clerk: `user.publicMetadata.ownedCourses` (string array)
- Used for fast checks, database is source of truth

## Example Scenarios

### User with Basic Tier
- ✅ Can access categories with `requiredTier: "free"` or `"basic"`
- 🔒 Cannot access categories with `requiredTier: "premium"` or `"pro"`
- Locked categories shown grayed out on `/panel/kursy`

### User with Premium Tier
- ✅ Can access categories with `requiredTier: "free"`, `"basic"`, or `"premium"`
- 🔒 Cannot access categories with `requiredTier: "pro"`

### User Not Enrolled
- ❌ Course doesn't appear on `/panel/kursy`
- ❌ Direct navigation to category detail shows "Brak dostępu"

---

## Stripe Payment Flow

### Checkout Session Creation

**Endpoint**: `/api/stripe/create-checkout-session`

**Current Implementation**:
1. Accepts `userId` and `priceId` from client
2. Creates Stripe checkout session with `client_reference_id: userId`
3. Returns `sessionUrl` for redirect

**For Course Purchases** (needs implementation):
- Must pass `courseSlug` and `accessTier` in session metadata:
  ```typescript
  metadata: {
    courseSlug: 'pielegniarstwo',
    accessTier: 'basic' // or 'premium', 'pro'
  }
  ```

### Webhook Handler

**Endpoint**: `/api/webhooks/stripe`

**Event**: `checkout.session.completed`

**Flow**:
1. Extract metadata from session:
   - `courseSlug` - which course to enroll user in
   - `accessTier` - what tier level (default: 'basic')

2. Verify payment status is 'paid'

3. **Enroll user in database**:
   - Call `enrollUserAction(userId, courseSlug, accessTier)`
   - Creates new enrollment OR updates existing with new tier
   - Sets `isActive: true`, updates `enrolledAt` timestamp

4. **Update Clerk metadata** (fast access):
   - Fetch user from Clerk
   - Get `publicMetadata.ownedCourses` array
   - Add `courseSlug` if not already present
   - Update user metadata

5. Log success or handle errors gracefully

### enrollUserAction Function

**File**: `/src/actions/course-actions.ts`

**Logic**:
```typescript
async function enrollUserAction(userId, courseSlug, accessTier = 'basic') {
  // Check if enrollment exists
  const existing = await db.query.courseEnrollments.find({
    where: { userId, courseSlug }
  })

  if (existing) {
    // Update existing enrollment (upgrade tier, reactivate)
    await db.update(courseEnrollments)
      .set({ isActive: true, accessTier, enrolledAt: new Date() })
      .where({ id: existing.id })
    return { success: true, updated: true }
  }

  // Create new enrollment
  await db.insert(courseEnrollments).values({
    userId,
    courseSlug,
    accessTier,
    isActive: true
  })
  return { success: true, updated: false }
}
```

**Key Features**:
- Idempotent - can be called multiple times safely
- Upgrades tier if user purchases higher tier
- Reactivates enrollment if previously cancelled
- Updates enrollment date on repurchase

### Payment Recording

**Subscription Mode** (`mode: 'subscription'`):
- Inserts record into `subscriptions` table
- Stores: sessionId, customerId, subscriptionId, courseSlug, accessTier

**Payment Mode** (`mode: 'payment'`):
- Inserts record into `payments` table
- Stores: userId, amountTotal, currency, courseSlug

### Database Tables

**courseEnrollments**:
- `userId` - Clerk user ID
- `courseSlug` - Course identifier
- `accessTier` - 'free' | 'basic' | 'premium' | 'pro'
- `isActive` - Boolean (for cancellations)
- `enrolledAt` - Timestamp of enrollment/update
- `expiresAt` - Optional expiration date

**subscriptions**:
- Payment records for subscription purchases
- Links to Stripe subscription ID

**payments**:
- Payment records for one-time purchases

### Access Check Flow

1. **Clerk Metadata** (fast check):
   - `user.publicMetadata.ownedCourses` array
   - Quick check if user owns course

2. **Database** (source of truth):
   - Query `courseEnrollments` with `userId` and `courseSlug`
   - Check `isActive: true`
   - Get `accessTier` for tier validation

3. **Fallback Logic**:
   - Try Clerk first for performance
   - Always verify in database for `accessTier`
   - Database is source of truth for access level

### Purchase to Access Timeline

1. User clicks "Buy Course" → redirects to Stripe checkout
2. User completes payment in Stripe
3. Stripe fires `checkout.session.completed` webhook
4. Webhook handler:
   - Creates/updates enrollment in database ✅
   - Updates Clerk metadata ✅
5. User redirected to success page
6. User navigates to `/panel/kursy`
7. Page fetches enrollments from database
8. Categories displayed with tier-based access control

### Important Notes

- **Webhook is critical** - without it, users won't get access after payment
- **Metadata is required** - `courseSlug` and `accessTier` must be in checkout session
- **Idempotent enrollment** - webhook can be called multiple times safely
- **Clerk sync** - `ownedCourses` is updated for fast checks, but database is source of truth
- **Tier upgrades** - if user buys premium after basic, enrollment is updated with new tier
