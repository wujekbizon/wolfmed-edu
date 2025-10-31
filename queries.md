# 🔍 Database Queries Documentation

## Overview
This document provides comprehensive documentation of all database queries used in the Wolfmed application. All queries are defined in `src/server/queries.ts` and use Drizzle ORM with React's `cache()` function for optimization.

---

## 📋 Table of Contents
1. [Test & Learning Queries](#test--learning-queries)
2. [User Management Queries](#user-management-queries)
3. [Forum Queries](#forum-queries)
4. [Payment & Subscription Queries](#payment--subscription-queries)
5. [Testimonial Queries](#testimonial-queries)
6. [Notes Queries](#notes-queries)
7. [Materials Queries](#materials-queries)
8. [Custom Cells Queries](#custom-cells-queries)
9. [Blog Queries](#blog-queries)

---

## 🎯 Test & Learning Queries

### `getAllTests()`
Retrieves all available test question banks.

**Returns:** `Promise<ExtendedTest[]>`

**Usage:**
```typescript
const tests = await getAllTests()
```

**Query Details:**
- Orders by: ID descending (newest first)
- Source table: `wolfmed_tests`

---

### `getAllProcedures()`
Retrieves all medical procedure definitions.

**Returns:** `Promise<ExtendedProcedures[]>`

**Usage:**
```typescript
const procedures = await getAllProcedures()
```

**Query Details:**
- Orders by: ID descending (newest first)
- Source table: `wolfmed_procedures`
- Includes: name, procedure, algorithm, image, equipment

---

### `getCompletedTestsByUser(userId: string)`
Gets all completed tests for a specific user.

**Parameters:**
- `userId` - User's authentication ID

**Returns:** `Promise<ExtendedCompletedTest[]>`

**Usage:**
```typescript
const completedTests = await getCompletedTestsByUser(userId)
```

**Query Details:**
- Filters by: `userId`
- Orders by: `completedAt` descending (most recent first)
- Source table: `wolfmed_completed_tests`

---

### `getCompletedTest(testId: string)`
Retrieves a specific completed test by ID.

**Parameters:**
- `testId` - UUID of the completed test

**Returns:** `Promise<ExtendedCompletedTest | undefined>`

**Usage:**
```typescript
const test = await getCompletedTest(testId)
```

---

### `getQuestionById(testId: string)`
Gets test questions by test ID.

**Parameters:**
- `testId` - UUID of the test

**Returns:** `Promise<ExtendedTest | undefined>`

**Usage:**
```typescript
const questions = await getQuestionById(testId)
```

---

### `deleteCompletedTest(testId: string)`
Deletes a completed test record.

**Parameters:**
- `testId` - UUID of the completed test

**Returns:** `Promise<void>`

**Usage:**
```typescript
await deleteCompletedTest(testId)
```

**⚠️ Warning:** This is a permanent deletion operation.

---

### `getTestSessionDetails(sessionId: string)`
Gets duration and question count for a test session.

**Parameters:**
- `sessionId` - UUID of the test session

**Returns:** `Promise<{ durationMinutes: number, numberOfQuestions: number } | undefined>`

**Usage:**
```typescript
const details = await getTestSessionDetails(sessionId)
```

---

### `sessionExists(sessionId: string)`
Checks if a test session exists.

**Parameters:**
- `sessionId` - UUID of the test session

**Returns:** `Promise<boolean>`

**Usage:**
```typescript
const exists = await sessionExists(sessionId)
```

---

### `expireTestSession(sessionId: string)`
Marks an active session as expired if past its expiration time.

**Parameters:**
- `sessionId` - UUID of the test session

**Returns:** `Promise<void>`

**Usage:**
```typescript
await expireTestSession(sessionId)
```

**Query Details:**
- Updates status to: `'EXPIRED'`
- Sets: `finishedAt` to current time
- Only affects: Active sessions past their `expiresAt` time

---

## 👤 User Management Queries

### `getUserTestLimit(id: string)`
Gets the remaining test limit for a user.

**Parameters:**
- `id` - User's authentication ID

**Returns:** `Promise<{ testLimit: number }>`

**Usage:**
```typescript
const { testLimit } = await getUserTestLimit(userId)
```

---

### `getUserUsername(userId: string)`
Retrieves a user's username.

**Parameters:**
- `userId` - User's authentication ID

**Returns:** `Promise<string>` (empty string if not found)

**Usage:**
```typescript
const username = await getUserUsername(userId)
```

---

### `updateUsernameByUserId(userId: string, newUsername: string)`
Updates a user's username.

**Parameters:**
- `userId` - User's authentication ID
- `newUsername` - New username to set

**Returns:** `Promise<void>`

**Usage:**
```typescript
await updateUsernameByUserId(userId, "NewUsername")
```

---

### `getUserMotto(userId: string)`
Retrieves a user's personal motto.

**Parameters:**
- `userId` - User's authentication ID

**Returns:** `Promise<string>` (empty string if not found)

**Usage:**
```typescript
const motto = await getUserMotto(userId)
```

---

### `updateMottoByUserId(userId: string, newMotto: string)`
Updates a user's motto.

**Parameters:**
- `userId` - User's authentication ID
- `newMotto` - New motto to set

**Returns:** `Promise<void>`

**Usage:**
```typescript
await updateMottoByUserId(userId, "Learning every day!")
```

---

### `getUserStats(userId: string)`
Gets comprehensive user statistics.

**Parameters:**
- `userId` - User's authentication ID

**Returns:** `Promise<{ totalScore: number, totalQuestions: number, testsAttempted: number }>`

**Usage:**
```typescript
const stats = await getUserStats(userId)
console.log(`Score: ${stats.totalScore}/${stats.totalQuestions}`)
```

---

### `getSupporterByUserId(userId: string)`
Checks if a user is a supporter.

**Parameters:**
- `userId` - User's authentication ID

**Returns:** `Promise<boolean>`

**Usage:**
```typescript
const isSupporter = await getSupporterByUserId(userId)
```

---

### `getEarlySupporters(limit?: number)`
Gets list of early supporters with usernames.

**Parameters:**
- `limit` - Maximum number of supporters to return (default: 5)

**Returns:** `Promise<{ id: string, username: string }[]>`

**Usage:**
```typescript
const supporters = await getEarlySupporters(10)
```

**Query Details:**
- Filters by: `supporter = true`
- Orders by: `createdAt` ascending (earliest first)
- Default limit: 5

---

### `getUserStorageUsage(userId: string)`
Gets user's storage usage and limit.

**Parameters:**
- `userId` - User's authentication ID

**Returns:** `Promise<{ storageUsed: number, storageLimit: number }>`

**Usage:**
```typescript
const { storageUsed, storageLimit } = await getUserStorageUsage(userId)
const percentUsed = (storageUsed / storageLimit) * 100
```

**Query Details:**
- Default limit: 20,000,000 bytes (20MB)
- Default used: 0 bytes
- Source table: `wolfmed_user_limits`

---

## 💬 Forum Queries

### `getAllForumPosts()`
Gets all forum posts with their comments.

**Returns:** `Promise<ForumPost[]>`

**Usage:**
```typescript
const posts = await getAllForumPosts()
```

**Query Details:**
- Orders posts by: `createdAt` descending
- Orders comments by: `createdAt` ascending
- Includes: All comments for each post
- Date formatting: ISO string format

---

### `getForumPostById(postId: string)`
Gets a specific forum post with comments.

**Parameters:**
- `postId` - UUID of the forum post

**Returns:** `Promise<ForumPost | null>`

**Usage:**
```typescript
const post = await getForumPostById(postId)
if (!post) {
  // Post not found
}
```

---

### `createForumPost(data)`
Creates a new forum post.

**Parameters:**
```typescript
{
  title: string
  content: string
  authorId: string
  authorName: string
  readonly: boolean
}
```

**Returns:** `Promise<ForumPost>`

**Usage:**
```typescript
const newPost = await createForumPost({
  title: "My Question",
  content: "Post content here...",
  authorId: userId,
  authorName: username,
  readonly: false
})
```

---

### `deleteForumPost(postId: string)`
Deletes a forum post and all its comments.

**Parameters:**
- `postId` - UUID of the forum post

**Returns:** `Promise<void>`

**Usage:**
```typescript
await deleteForumPost(postId)
```

**⚠️ Warning:** 
- Cascades to delete all comments
- Permanent deletion

---

### `createForumComment(data)`
Adds a comment to a forum post.

**Parameters:**
```typescript
{
  postId: string
  content: string
  authorId: string
  authorName: string
}
```

**Returns:** `Promise<ForumComment>`

**Usage:**
```typescript
const comment = await createForumComment({
  postId: postId,
  content: "My reply...",
  authorId: userId,
  authorName: username
})
```

---

### `deleteForumComment(commentId: string)`
Deletes a specific comment.

**Parameters:**
- `commentId` - UUID of the comment

**Returns:** `Promise<void>`

**Usage:**
```typescript
await deleteForumComment(commentId)
```

---

### `getLastUserPostTime(userId: string)`
Gets timestamp of user's most recent forum post.

**Parameters:**
- `userId` - User's authentication ID

**Returns:** `Promise<Date | null>`

**Usage:**
```typescript
const lastPostTime = await getLastUserPostTime(userId)
if (lastPostTime) {
  const timeSince = Date.now() - lastPostTime.getTime()
  // Check rate limiting
}
```

**Use Case:** Rate limiting post creation

---

### `getLastUserCommentTime(userId: string)`
Gets timestamp of user's most recent comment.

**Parameters:**
- `userId` - User's authentication ID

**Returns:** `Promise<Date | null>`

**Usage:**
```typescript
const lastCommentTime = await getLastUserCommentTime(userId)
```

**Use Case:** Rate limiting comment creation

---

## 💳 Payment & Subscription Queries

### `getUserIdByCustomer(customerId: string)`
Gets userId from Stripe customer ID.

**Parameters:**
- `customerId` - Stripe customer ID

**Returns:** `Promise<string | null>`

**Usage:**
```typescript
const userId = await getUserIdByCustomer(customerId)
```

**Query Details:**
- Source table: `wolfmed_stripe_subscriptions`
- Throws error if subscription not found

---

### `getUserIdByCustomerEmail(customerEmail: string)`
Gets userId from customer email.

**Parameters:**
- `customerEmail` - Customer's email address

**Returns:** `Promise<string | null>`

**Usage:**
```typescript
const userId = await getUserIdByCustomerEmail(email)
```

**Query Details:**
- Source table: `wolfmed_stripe_payments`
- Throws error if payment not found

---

### `getStripeSupportPayments()`
Gets all support payments.

**Returns:** `Promise<Payment[]>`

**Usage:**
```typescript
const payments = await getStripeSupportPayments()
```

---

### `getSupportersUserIds()`
Gets array of all supporter user IDs.

**Returns:** `Promise<string[]>`

**Usage:**
```typescript
const supporterIds = await getSupportersUserIds()
```

---

### `getSupportersWithUsernames()`
Gets supporters with their usernames.

**Returns:** `Promise<Supporter[]>`

**Usage:**
```typescript
const supporters = await getSupportersWithUsernames()
// Returns: [{ id, userId, username }, ...]
```

**Query Details:**
- Joins: `users` and `payments` tables
- Only includes users with payments

---

## ⭐ Testimonial Queries

### `createTestimonial(data)`
Creates a new testimonial.

**Parameters:**
```typescript
{
  userId: string
  content: string
  rating: number
  visible: boolean
}
```

**Returns:** `Promise<Testimonial>`

**Usage:**
```typescript
const testimonial = await createTestimonial({
  userId: userId,
  content: "Great platform!",
  rating: 5,
  visible: true
})
```

---

### `getTestimonials(visibleOnly?: boolean)`
Gets testimonials, optionally filtering by visibility.

**Parameters:**
- `visibleOnly` - If true, only returns visible testimonials (default: true)

**Returns:** `Promise<Testimonial[]>`

**Usage:**
```typescript
const publicTestimonials = await getTestimonials(true)
const allTestimonials = await getTestimonials(false)
```

**Query Details:**
- Orders by: `createdAt` descending

---

### `getTestimonialsWithUsernames(visibleOnly?: boolean)`
Gets testimonials with author usernames.

**Parameters:**
- `visibleOnly` - If true, only returns visible testimonials (default: true)

**Returns:** `Promise<TestimonialWithUsername[]>`

**Usage:**
```typescript
const testimonials = await getTestimonialsWithUsernames()
// Returns: [{ id, content, rating, visible, createdAt, updatedAt, userId, username }, ...]
```

---

### `getUserTestimonials(userId: string)`
Gets all testimonials by a specific user.

**Parameters:**
- `userId` - User's authentication ID

**Returns:** `Promise<Testimonial[]>`

**Usage:**
```typescript
const myTestimonials = await getUserTestimonials(userId)
```

---

### `updateTestimonial(id: string, data)`
Updates an existing testimonial.

**Parameters:**
- `id` - Testimonial UUID
- `data` - Partial update object
```typescript
{
  content?: string
  rating?: number
  visible?: boolean
}
```

**Returns:** `Promise<Testimonial>`

**Usage:**
```typescript
const updated = await updateTestimonial(testimonialId, {
  content: "Updated content",
  rating: 4
})
```

---

### `deleteTestimonial(id: string)`
Deletes a testimonial.

**Parameters:**
- `id` - Testimonial UUID

**Returns:** `Promise<Testimonial>`

**Usage:**
```typescript
await deleteTestimonial(testimonialId)
```

---

## 📝 Notes Queries

### `getAllUserNotes(userId: string)`
Gets all notes for a user.

**Parameters:**
- `userId` - User's authentication ID

**Returns:** `Promise<Note[]>`

**Usage:**
```typescript
const notes = await getAllUserNotes(userId)
```

**Query Details:**
- Orders by: `createdAt` descending (newest first)
- Dates formatted as ISO strings

---

### `getTopPinnedNotes(userId: string, limit?: number)`
Gets user's pinned notes.

**Parameters:**
- `userId` - User's authentication ID
- `limit` - Maximum number of notes (default: 5)

**Returns:** `Promise<Note[]>`

**Usage:**
```typescript
const pinnedNotes = await getTopPinnedNotes(userId, 3)
```

**Query Details:**
- Filters by: `pinned = true`
- Orders by: `createdAt` descending

---

### `getNoteById(userId: string, noteId: string)`
Gets a specific note.

**Parameters:**
- `userId` - User's authentication ID
- `noteId` - Note UUID

**Returns:** `Promise<Note | null>`

**Usage:**
```typescript
const note = await getNoteById(userId, noteId)
if (!note) {
  // Note not found or doesn't belong to user
}
```

---

### `createNote(userId: string, data: NoteInput)`
Creates a new note.

**Parameters:**
- `userId` - User's authentication ID
- `data` - Note data object
```typescript
{
  title: string
  content: string // JSON string from Lexical editor
  plainText: string
  excerpt: string
  category: string
  tags: string[]
  pinned: boolean
}
```

**Returns:** `Promise<Note>`

**Usage:**
```typescript
const newNote = await createNote(userId, {
  title: "Study Notes",
  content: JSON.stringify(lexicalState),
  plainText: "Plain text version...",
  excerpt: "First 150 chars...",
  category: "Cardiology",
  tags: ["important", "exam"],
  pinned: false
})
```

**Note:** Content is parsed from JSON string to JSONB

---

### `updateNote(userId: string, noteId: string, data: Partial<NoteInput>)`
Updates an existing note.

**Parameters:**
- `userId` - User's authentication ID
- `noteId` - Note UUID
- `data` - Partial update object

**Returns:** `Promise<Note | null>`

**Usage:**
```typescript
const updated = await updateNote(userId, noteId, {
  title: "Updated Title",
  pinned: true
})
```

---

### `deleteNote(userId: string, noteId: string)`
Deletes a note.

**Parameters:**
- `userId` - User's authentication ID
- `noteId` - Note UUID

**Returns:** `Promise<Note | null>`

**Usage:**
```typescript
const deleted = await deleteNote(userId, noteId)
```

---

## 📁 Materials Queries

### `getMaterialsByUser(userId: string)`
Gets all uploaded materials for a user.

**Parameters:**
- `userId` - User's authentication ID

**Returns:** `Promise<Material[]>`

**Usage:**
```typescript
const materials = await getMaterialsByUser(userId)
```

**Query Details:**
- Orders by: `createdAt` descending
- Dates formatted as ISO strings
- Includes: title, key, url, type, category, size

---

## 🎨 Custom Cells Queries

### `getUserCellsList(userId: string)`
Gets user's custom dashboard cells configuration.

**Parameters:**
- `userId` - User's authentication ID

**Returns:** `Promise<UserCellsList | null>`

**Usage:**
```typescript
const cellsConfig = await getUserCellsList(userId)
if (cellsConfig) {
  const { cells, order } = cellsConfig
  // cells: Record<string, Cell>
  // order: string[]
}
```

---

### `checkUserCellsList(userId: string)`
Checks if user has a cells configuration.

**Parameters:**
- `userId` - User's authentication ID

**Returns:** `Promise<UserCellsList | null>`

**Usage:**
```typescript
const exists = await checkUserCellsList(userId)
if (!exists) {
  // Initialize default cells
}
```

---

### `createUserCellsList(userId: string, cells: Record<string, Cell>, order: string[])`
Creates initial cells configuration.

**Parameters:**
- `userId` - User's authentication ID
- `cells` - Cell definitions object
- `order` - Array of cell IDs in display order

**Returns:** `Promise<void>`

**Usage:**
```typescript
await createUserCellsList(userId, {
  'cell1': { type: 'stats', config: {} },
  'cell2': { type: 'notes', config: {} }
}, ['cell1', 'cell2'])
```

---

### `updateUserCellsList(userId: string, cells: Record<string, Cell>, order: string[])`
Updates cells configuration.

**Parameters:**
- `userId` - User's authentication ID
- `cells` - Updated cell definitions
- `order` - Updated display order

**Returns:** `Promise<void>`

**Usage:**
```typescript
await updateUserCellsList(userId, updatedCells, newOrder)
```

---

## 📰 Blog Queries

### `getAllPosts()`
Gets all blog posts.

**Returns:** `Promise<Post[]>`

**Usage:**
```typescript
const posts = await getAllPosts()
```

**Query Details:**
- Orders by: ID descending (newest first)

---

### `getPostById(id: string)`
Gets a specific blog post.

**Parameters:**
- `id` - Post UUID

**Returns:** `Promise<Post | undefined>`

**Usage:**
```typescript
const post = await getPostById(postId)
```

---

## 🔧 Common Patterns & Best Practices

### Query Caching
All queries use React's `cache()` function for request deduplication:
```typescript
export const getExample = cache(async (id: string) => {
  // Query logic
})
```

### Date Handling
Dates are returned as ISO strings for client compatibility:
```typescript
return posts.map(post => ({
  ...post,
  createdAt: post.createdAt.toISOString()
}))
```

### Error Handling
Queries that might fail throw errors:
```typescript
try {
  const result = await getUserIdByCustomer(customerId)
} catch (error) {
  console.error('Error:', error)
}
```

### Null Safety
Queries return `null` or `undefined` when data not found:
```typescript
const user = await getUserById(id)
if (!user) {
  // Handle not found case
}
```

### JSON Data
JSONB fields are typed appropriately:
```typescript
// Input: Parse JSON strings
content: JSON.parse(data.content)

// Output: Return as typed objects
data: jsonb (not null) // Returns as object/array
```

---

## 📊 Query Performance Considerations

### Indexed Fields
Queries on these fields are optimized:
- `users.userId`
- `users.username`
- `notes.userId`, `notes.category`, `notes.pinned`
- `materials.userId`, `materials.category`
- `forumPosts.authorId`, `forumComments.postId`

### Relationships
Use `with` for efficient joins:
```typescript
db.query.forumPosts.findMany({
  with: {
    comments: true
  }
})
```

### Limits
Always use limits for large datasets:
```typescript
.limit(100) // Prevent excessive data transfer
```

---

## 🚀 Future Query Enhancements

### Planned Additions
- Full-text search for notes
- Paginated queries for large datasets
- Aggregation queries for analytics
- Bulk operations for efficiency
- Transaction support for complex operations

### Performance Monitoring
- Add query timing logs
- Implement slow query detection
- Track cache hit rates
- Monitor database connection pool

---

**Last Updated:** October 31, 2024  
**File Location:** `src/server/queries.ts`  
**ORM Version:** Drizzle ORM v0.29+