# 🗄️ Database Schema Documentation

## Overview
This document provides comprehensive documentation of the Wolfmed database schema using Drizzle ORM with PostgreSQL. All tables use the `wolfmed_` prefix via `pgTableCreator`.

---

## 📊 Core Tables

### Users (`wolfmed_users`)
Primary user account and profile information.

```typescript
{
  id: uuid (PK, auto-generated)
  userId: varchar(256) (unique, not null) // External auth provider ID
  username: varchar(256) (default: "", not null)
  motto: varchar (default: "", not null)
  testLimit: integer (default: 150)
  testsAttempted: integer (default: 0, not null)
  totalScore: integer (default: 0, not null)
  totalQuestions: integer (default: 0, not null)
  supporter: boolean (default: false, not null)
  createdAt: timestamp (auto)
  updatedAt: timestamp
}
```

**Indexes:**
- `usersUserId` on `userId`
- `usersUsername` on `username`

**Relations:**
- One-to-many with `testimonials`
- One-to-many with `forumPosts` (via authorId)
- One-to-many with `forumComments` (via authorId)
- One-to-many with `notes`
- One-to-many with `materials`
- One-to-one with `userLimits`

---

## 💳 Payment & Subscription Tables

### Payments (`wolfmed_stripe_payments`)
Tracks one-time payments via Stripe.

```typescript
{
  id: uuid (PK, auto-generated)
  userId: varchar(256) (not null)
  amountTotal: integer (not null)
  currency: enum('pln', 'usd', 'eur')
  customerEmail: varchar(256) (not null)
  paymentStatus: varchar(50) (not null)
  createdAt: timestamp (auto)
}
```

### Subscriptions (`wolfmed_stripe_subscriptions`)
Manages recurring Stripe subscriptions.

```typescript
{
  id: uuid (PK, auto-generated)
  userId: varchar(256) (unique, not null)
  sessionId: varchar(256) (not null)
  subscriptionId: varchar(256) (not null)
  customerId: varchar(256) (not null)
  customerEmail: varchar(256) (not null)
  invoiceId: varchar(256) (not null)
  amountTotal: integer (not null)
  currency: enum('pln', 'usd', 'eur')
  paymentStatus: varchar(50) (not null)
  createdAt: timestamp (auto, not null)
}
```

### Processed Events (`wolfmed_processed_events`)
Prevents duplicate webhook processing.

```typescript
{
  id: uuid (PK, auto-generated)
  eventId: varchar(256) (unique, not null)
  userId: varchar(256) (not null)
  processedAt: timestamp (auto)
}
```

---

## 🎯 Test & Learning System

### Test Sessions (`wolfmed_test_sessions`)
Active and completed test sessions.

```typescript
{
  id: uuid (PK, auto-generated)
  userId: varchar(256) (FK → users.userId, cascade delete, not null)
  category: varchar(128) (not null)
  numberOfQuestions: integer (not null)
  durationMinutes: integer (not null)
  startedAt: timestamp (auto, not null)
  expiresAt: timestamp (not null)
  finishedAt: timestamp
  status: varchar(32) (not null, default: 'ACTIVE')
    // Type: 'ACTIVE' | 'EXPIRED' | 'COMPLETED' | 'CANCELLED'
  meta: jsonb (default: {})
}
```

### Completed Tests (`wolfmed_completed_tests`)
Results of finished test sessions.

```typescript
{
  id: uuid (PK, auto-generated)
  userId: varchar(256) (FK → users.userId, cascade delete, not null)
  sessionId: uuid (FK → testSessions.id, cascade delete, not null)
  testResult: jsonb (default: [])
  score: integer (not null)
  completedAt: timestamp (auto, not null)
}
```

### Tests (`wolfmed_tests`)
Test question banks organized by category.

```typescript
{
  id: uuid (PK, auto-generated)
  category: varchar(256) (not null)
  data: jsonb (not null) // Questions and answers
  createdAt: timestamp (auto)
  updatedAt: timestamp
}
```

### Procedures (`wolfmed_procedures`)
Medical procedure definitions and algorithms.

```typescript
{
  id: uuid (PK, auto-generated)
  data: jsonb (not null) // Full procedure data including:
    // - name: string
    // - procedure: string (description)
    // - algorithm: string[] (step-by-step instructions)
    // - image: string (URL)
    // - equipment: string[] (optional)
  createdAt: timestamp (auto)
  updatedAt: timestamp
}
```

**Note:** Procedures are the source of truth for:
- Challenge generation (algorithm steps)
- Visual recognition challenges (images/equipment)
- Badge generation (procedure name + image)
- Scenario-based challenges (algorithm logic)

---

## 🗒️ Notes System

### Notes (`wolfmed_notes`)
User-created study notes with rich content.

```typescript
{
  id: uuid (PK, auto-generated)
  userId: varchar(256) (FK → users.userId, cascade delete, not null)
  title: varchar(256) (not null)
  content: jsonb (not null) // Rich text editor content
  plainText: text // Searchable plain text version
  excerpt: text (default: "")
  category: varchar(128) (not null)
  tags: jsonb (default: [])
  pinned: boolean (default: false, not null)
  createdAt: timestamp (auto, not null)
  updatedAt: timestamp (auto, not null)
}
```

**Indexes:**
- `notes_user_id_idx` on `userId`
- `notes_category_idx` on `category`
- `notes_pinned_idx` on `pinned`
- `notes_created_at_idx` on `createdAt`

---

## 📚 Materials System

### Materials (`wolfmed_materials`)
User-uploaded files and study materials.

```typescript
{
  id: uuid (PK, auto-generated)
  userId: varchar(256) (FK → users.userId, cascade delete, not null)
  title: varchar(256) (not null)
  key: varchar(256) (unique, not null) // Storage key (e.g., S3)
  url: text (not null) // Access URL
  type: varchar(64) (not null) // MIME type
  category: varchar(128) (not null)
  size: integer (not null) // Bytes
  createdAt: timestamp (auto, not null)
  updatedAt: timestamp (auto, not null)
}
```

**Indexes:**
- `materials_user_id_idx` on `userId`
- `materials_category_idx` on `category`
- `materials_type_idx` on `type`

**Relations:**
- Many-to-one with `users`

### User Limits (`wolfmed_user_limits`)
Storage quotas and usage tracking.

```typescript
{
  id: uuid (PK, auto-generated)
  userId: varchar(256) (FK → users.userId, cascade delete, unique, not null)
  storageLimit: integer (default: 20_000_000, not null) // 20MB default
  storageUsed: integer (default: 0, not null)
  createdAt: timestamp (auto, not null)
  updatedAt: timestamp (auto, not null)
}
```

**Indexes:**
- `user_limits_user_id_idx` on `userId`

**Relations:**
- One-to-one with `users`

---

## 💬 Community Features

### Forum Posts (`wolfmed_forum_posts`)
Discussion threads created by users.

```typescript
{
  id: uuid (PK, auto-generated)
  title: varchar(256) (not null)
  content: text (not null)
  authorId: varchar(256) (FK → users.userId, cascade delete, not null)
  authorName: varchar(256) (not null)
  readonly: boolean (default: false, not null)
  createdAt: timestamp (auto, not null)
  updatedAt: timestamp (auto, not null)
}
```

**Indexes:**
- `forum_posts_author_id_idx` on `authorId`
- `forum_posts_created_at_idx` on `createdAt`

**Relations:**
- One-to-many with `forumComments`

### Forum Comments (`wolfmed_forum_comments`)
Replies to forum posts.

```typescript
{
  id: uuid (PK, auto-generated)
  content: text (not null)
  postId: uuid (FK → forumPosts.id, cascade delete, not null)
  authorId: varchar(256) (FK → users.userId, cascade delete, not null)
  authorName: varchar(256) (not null)
  createdAt: timestamp (auto, not null)
}
```

**Indexes:**
- `forum_comments_post_id_idx` on `postId`
- `forum_comments_author_id_idx` on `authorId`
- `forum_comments_created_at_idx` on `createdAt`

**Relations:**
- Many-to-one with `forumPosts`

### Testimonials (`wolfmed_testimonials`)
User reviews and feedback.

```typescript
{
  id: uuid (PK, auto-generated)
  userId: varchar(256) (FK → users.userId, cascade delete, not null)
  content: text (not null)
  rating: real (default: 5, not null)
  visible: boolean (default: true, not null)
  createdAt: timestamp (auto, not null)
  updatedAt: timestamp (auto, not null)
}
```

**Indexes:**
- `testimonials_user_id_idx` on `userId`
- `testimonials_created_at_idx` on `createdAt`

**Relations:**
- Many-to-one with `users` (relationName: 'testimonialsAuthor')

---

## 📝 Content Management

### Blog Posts (`wolfmed_blog_posts`)
Educational articles and updates.

```typescript
{
  id: uuid (PK, auto-generated)
  title: varchar(256) (not null)
  date: varchar(64) (not null)
  excerpt: text (not null)
  content: text (not null)
  createdAt: timestamp (auto)
  updatedAt: timestamp
}
```

### Customer Messages (`wolfmed_messages`)
Contact form submissions.

```typescript
{
  id: serial (PK, auto-increment)
  email: text (not null)
  message: text (not null)
  createdAt: timestamp (auto, not null)
  updatedAt: timestamp
}
```

---

## 🧬 Custom Cell System

### User Cells List (`wolfmed_user_cells_list`)
Personalized cell/component configurations.

```typescript
{
  id: uuid (PK, auto-generated)
  userId: varchar(256) (FK → users.userId, cascade delete, not null)
  cells: jsonb (not null) // Cell definitions and data
  order: jsonb (not null) // Display order
  createdAt: timestamp (auto, not null)
  updatedAt: timestamp (auto, not null)
}
```

**Indexes:**
- `user_cells_list_user_id_idx` on `userId`

---

## 🎯 Challenge System (Planned)

> **Note:** Challenge-related data will be stored using Claude's persistent storage API, not in PostgreSQL. This section documents the planned storage structure.

### Challenge Completions (Claude Storage)
```typescript
// Key: `challenge:${userId}:${procedureId}:${challengeType}`
interface StoredCompletion {
  completed: boolean;
  completedAt: string; // ISO date
  score: number;
  timeSpent: number; // seconds
  attempts: number;
}
```

### Procedure Badges (Claude Storage)
```typescript
// Key: `badge:${userId}:${procedureId}`
interface StoredBadge {
  earned: boolean;
  earnedAt: string; // ISO date
  procedureId: string;
  procedureName: string;
  badgeImageUrl: string;
}
```

### User Progress Summary (Claude Storage)
```typescript
// Key: `progress:${userId}`
interface UserProgress {
  totalBadges: number;
  proceduresCompleted: string[]; // procedure IDs
  lastActivity: string; // ISO date
}
```

---

## 🔗 Key Relationships Summary

```
users (1) ←→ (1) userLimits
users (1) ←→ (n) materials
users (1) ←→ (n) notes
users (1) ←→ (n) testimonials
users (1) ←→ (n) forumPosts
users (1) ←→ (n) forumComments
users (1) ←→ (n) testSessions
users (1) ←→ (n) completedTests

testSessions (1) ←→ (n) completedTests

forumPosts (1) ←→ (n) forumComments

procedures → (data.jsonb) → challenges (via algorithm)
```

---

## 📋 Enums

### Currency Enum
```typescript
type Currency = 'pln' | 'usd' | 'eur'
```

### Test Session Status
```typescript
type SessionStatus = 'ACTIVE' | 'EXPIRED' | 'COMPLETED' | 'CANCELLED'
```

---

## 🔍 Common Query Patterns

### Get User with Limits
```typescript
const userWithLimits = await db.query.users.findFirst({
  where: eq(users.userId, userId),
  with: {
    userLimits: true
  }
});
```

### Get User Materials by Category
```typescript
const materials = await db.query.materials.findMany({
  where: and(
    eq(materials.userId, userId),
    eq(materials.category, category)
  ),
  orderBy: [desc(materials.createdAt)]
});
```

### Get Forum Post with Comments
```typescript
const post = await db.query.forumPosts.findFirst({
  where: eq(forumPosts.id, postId),
  with: {
    comments: {
      orderBy: [asc(forumComments.createdAt)]
    }
  }
});
```

### Get Active Test Session
```typescript
const session = await db.query.testSessions.findFirst({
  where: and(
    eq(testSessions.userId, userId),
    eq(testSessions.status, 'ACTIVE'),
    gt(testSessions.expiresAt, new Date())
  )
});
```

---

## 🚀 Future Considerations

### Potential New Tables
- `wolfmed_challenge_templates` - Predefined challenge configurations
- `wolfmed_user_achievements` - Achievement system beyond badges
- `wolfmed_study_groups` - Collaborative learning groups
- `wolfmed_procedure_feedback` - User feedback on procedures
- `wolfmed_notification_preferences` - User notification settings

### Potential Modifications
- Add `deletedAt` for soft deletes
- Add `version` for optimistic locking
- Add full-text search indexes for notes/materials
- Add composite indexes for common query patterns

---

**Last Updated:** October 31, 2025  
**Schema Version:** 1.0  
**ORM:** Drizzle ORM  
**Database:** PostgreSQL