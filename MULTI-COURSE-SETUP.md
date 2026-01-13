# Multi-Course System - Setup Guide

This implements a scalable course enrollment system while keeping all existing UI and logic intact.

## What Changed

**Database:** Added `courses` and `course_enrollments` tables
**Logic:** Test pages now check course enrollment before showing content
**Stripe:** Webhook handles course enrollments via metadata
**UI:** NO changes - same routes, same components

## Setup Steps

### 1. Run Database Migration

Open your Neon console and run `/migrations/multi-course-setup.sql`

This creates:
- `wolfmed_courses` - catalog of available courses
- `wolfmed_course_enrollments` - tracks user enrollments
- Adds `course_slug` to payment tables

### 2. Add Test Data File

Create `/data/fizjologia.json` with test questions:

```json
[
  {
    "id": "unique-id",
    "category": "fizjologia",
    "data": {
      "question": "Your question here",
      "answers": [
        {"option": "Answer 1", "isCorrect": false},
        {"option": "Answer 2", "isCorrect": true},
        {"option": "Answer 3", "isCorrect": false},
        {"option": "Answer 4", "isCorrect": false}
      ]
    },
    "createdAt": "2025-01-13 10:00:00"
  }
]
```

### 3. Configure Test User in Clerk

Go to Clerk Dashboard → Users → Select test user → Metadata tab

Add to **Public Metadata**:
```json
{
  "ownedCourses": ["pielegniarstwo"]
}
```

### 4. Test the Flow

**With enrolled user:**
Visit `/panel/testy/fizjologia?sessionId=xxx`
Should show tests normally

**Without enrollment:**
Different user visits same URL
Should show "Brak dostępu" message

## How It Works

**Category Mapping:**
Edit `/src/constants/courseCategoryMapping.ts` to map test categories to courses

```typescript
export const COURSE_CATEGORY_MAPPING = {
  "opiekun-medyczny": "opiekun-medyczny",
  "fizjologia": "pielegniarstwo",  // New course
  "anatomia": "pielegniarstwo",    // New course
};
```

**Access Check:**
The test page (`/panel/testy/[value]`) checks if the category requires a course enrollment. If yes and user doesn't have it, shows access denied.

**Backward Compatibility:**
`opiekun-medyczny` bypasses the check, so existing users with `isSupporter` flag continue working as before.

## Stripe Integration

When creating checkout sessions, add metadata:

```typescript
metadata: {
  courseSlug: "pielegniarstwo",
  accessTier: "premium"
}
```

Webhook automatically:
1. Creates enrollment in database
2. Updates Clerk user metadata
3. User gets instant access

## Adding New Courses

1. Insert course in database:
```sql
INSERT INTO wolfmed_courses (slug, name, description)
VALUES ('new-course', 'Course Name', 'Description');
```

2. Add test JSON file: `/data/category-name.json`

3. Map category to course in `courseCategoryMapping.ts`

4. Create Stripe product with metadata `courseSlug: new-course`

Done! No code changes needed.

## Key Files Modified

- `/src/server/db/schema.ts` - Added course tables
- `/src/actions/course-actions.ts` - Enrollment logic
- `/src/app/panel/testy/[value]/page.tsx` - Added access check
- `/src/app/api/webhooks/stripe/route.ts` - Added enrollment handler
- `/src/constants/courseCategoryMapping.ts` - Category to course mapping

## Important Notes

- **Existing logic preserved** - All opiekun-medyczny functionality unchanged
- **Same UI** - No new routes, no UI changes
- **Flexible** - Easy to add more courses by updating mapping
- **Scalable** - Supports unlimited courses without code changes
