# Wolfmed Medical Education Platform - Modern Blog System Design

**Version:** 1.0
**Date:** 2025-11-05
**Platform:** Next.js 15 + PostgreSQL + Drizzle ORM
**Theme:** Medical Education

---

## Executive Summary

This document outlines the design and implementation plan for transforming the current simple blog into a fully-featured, modern medical education blog platform. The new system will support rich content creation, user engagement, advanced search, and comprehensive content management.

---

## Current State Analysis

### Existing Implementation
- **Storage:** JSON file (`/data/blogPosts.json`) with 12 posts
- **Content Format:** Plain text with `\n` separators
- **Features:**
  - Basic listing page with pagination (6 posts/page)
  - Client-side search (title, excerpt, content)
  - Individual post detail pages
  - Clerk authentication protection
  - Static site generation

### Limitations
- ❌ No CRUD interface for content management
- ❌ No rich text or media support
- ❌ No categories, tags, or organization
- ❌ No user engagement (comments, likes, shares)
- ❌ No analytics or tracking
- ❌ Manual JSON file editing required
- ❌ No SEO optimization beyond basic metadata

---

## Design Goals

### Primary Objectives
1. **Professional Content Management** - Admin dashboard for creating/editing posts
2. **Rich Content Support** - MDX/Markdown with embedded media
3. **Better Organization** - Categories, tags, and advanced filtering
4. **User Engagement** - Comments, likes, and social sharing
5. **SEO Excellence** - Advanced meta tags, structured data, RSS
6. **Analytics** - View counts, reading time, popular posts
7. **Modern UX** - Responsive design matching existing medical theme

### Technical Principles
- Leverage existing infrastructure (Drizzle ORM, Clerk, Tanstack Query)
- Maintain performance (Server Components, static generation where possible)
- Type-safe development (TypeScript throughout)
- Reuse patterns from Forum implementation
- Progressive enhancement approach

---

## System Architecture

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 15 App Router | SSR, routing, server actions |
| **Database** | PostgreSQL (Neon) | Persistent storage |
| **ORM** | Drizzle ORM | Type-safe database queries |
| **Auth** | Clerk | Admin authentication |
| **State** | Zustand | Client-side state (search, filters) |
| **Data Fetching** | TanStack Query | Caching, optimistic updates |
| **Rich Text** | Lexical Editor | Content creation/editing |
| **Markdown** | MDX | Rich content rendering |
| **Styling** | Tailwind CSS | Medical theme styling |
| **Validation** | Zod | Server-side validation |

---

## Database Schema Design

### Enhanced Blog Posts Table

```typescript
export const blogPosts = createTable(
  'blog_posts',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    // Content fields
    title: varchar('title', { length: 256 }).notNull(),
    slug: varchar('slug', { length: 256 }).notNull().unique(),
    excerpt: text('excerpt').notNull(),
    content: text('content').notNull(), // MDX/Markdown
    coverImage: varchar('cover_image', { length: 512 }),

    // Organization
    categoryId: uuid('category_id').references(() => blogCategories.id),

    // Metadata
    authorId: varchar('author_id', { length: 256 }).notNull(),
    authorName: varchar('author_name', { length: 256 }).notNull(),

    // Publishing
    status: pgEnum(['draft', 'published', 'archived']).notNull().default('draft'),
    publishedAt: timestamp('published_at'),

    // SEO
    metaTitle: varchar('meta_title', { length: 256 }),
    metaDescription: text('meta_description'),
    metaKeywords: text('meta_keywords'),

    // Analytics
    viewCount: integer('view_count').default(0),
    readingTime: integer('reading_time'), // in minutes

    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: index('blog_posts_slug_idx').on(table.slug),
    categoryIdx: index('blog_posts_category_idx').on(table.categoryId),
    authorIdx: index('blog_posts_author_idx').on(table.authorId),
    statusIdx: index('blog_posts_status_idx').on(table.status),
    publishedAtIdx: index('blog_posts_published_at_idx').on(table.publishedAt),
  })
)
```

### Blog Categories Table

```typescript
export const blogCategories = createTable(
  'blog_categories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 100 }).notNull().unique(),
    slug: varchar('slug', { length: 100 }).notNull().unique(),
    description: text('description'),
    color: varchar('color', { length: 7 }).default('#ef4444'), // Hex color
    icon: varchar('icon', { length: 50 }), // Icon name
    order: integer('order').default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: index('blog_categories_slug_idx').on(table.slug),
  })
)
```

### Blog Tags Table (Many-to-Many)

```typescript
export const blogTags = createTable(
  'blog_tags',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 50 }).notNull().unique(),
    slug: varchar('slug', { length: 50 }).notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: index('blog_tags_slug_idx').on(table.slug),
  })
)

export const blogPostTags = createTable(
  'blog_post_tags',
  {
    postId: uuid('post_id')
      .notNull()
      .references(() => blogPosts.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id')
      .notNull()
      .references(() => blogTags.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    pk: primaryKey(table.postId, table.tagId),
    postIdx: index('blog_post_tags_post_idx').on(table.postId),
    tagIdx: index('blog_post_tags_tag_idx').on(table.tagId),
  })
)
```

### Blog Comments Table

```typescript
export const blogComments = createTable(
  'blog_comments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    content: text('content').notNull(),
    postId: uuid('post_id')
      .notNull()
      .references(() => blogPosts.id, { onDelete: 'cascade' }),
    authorId: varchar('author_id', { length: 256 }).notNull(),
    authorName: varchar('author_name', { length: 256 }).notNull(),

    // Moderation
    status: pgEnum(['pending', 'approved', 'rejected']).default('approved'),

    // Nested comments support
    parentId: uuid('parent_id').references(() => blogComments.id, { onDelete: 'cascade' }),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at'),
  },
  (table) => ({
    postIdx: index('blog_comments_post_idx').on(table.postId),
    authorIdx: index('blog_comments_author_idx').on(table.authorId),
    parentIdx: index('blog_comments_parent_idx').on(table.parentId),
  })
)
```

### Blog Likes Table

```typescript
export const blogLikes = createTable(
  'blog_likes',
  {
    userId: varchar('user_id', { length: 256 }).notNull(),
    postId: uuid('post_id')
      .notNull()
      .references(() => blogPosts.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey(table.userId, table.postId),
    postIdx: index('blog_likes_post_idx').on(table.postId),
  })
)
```

### Drizzle Relations

```typescript
export const blogPostsRelations = relations(blogPosts, ({ one, many }) => ({
  category: one(blogCategories, {
    fields: [blogPosts.categoryId],
    references: [blogCategories.id],
  }),
  tags: many(blogPostTags),
  comments: many(blogComments),
  likes: many(blogLikes),
}))

export const blogCategoriesRelations = relations(blogCategories, ({ many }) => ({
  posts: many(blogPosts),
}))

export const blogTagsRelations = relations(blogTags, ({ many }) => ({
  posts: many(blogPostTags),
}))

export const blogPostTagsRelations = relations(blogPostTags, ({ one }) => ({
  post: one(blogPosts, {
    fields: [blogPostTags.postId],
    references: [blogPosts.id],
  }),
  tag: one(blogTags, {
    fields: [blogPostTags.tagId],
    references: [blogTags.id],
  }),
}))

export const blogCommentsRelations = relations(blogComments, ({ one, many }) => ({
  post: one(blogPosts, {
    fields: [blogComments.postId],
    references: [blogPosts.id],
  }),
  parent: one(blogComments, {
    fields: [blogComments.parentId],
    references: [blogComments.id],
  }),
  replies: many(blogComments),
}))
```

---

## TypeScript Types

```typescript
// Enhanced Post type
export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string // MDX/Markdown
  coverImage: string | null
  categoryId: string | null
  authorId: string
  authorName: string
  status: 'draft' | 'published' | 'archived'
  publishedAt: Date | null
  metaTitle: string | null
  metaDescription: string | null
  metaKeywords: string | null
  viewCount: number
  readingTime: number | null
  createdAt: Date
  updatedAt: Date

  // Relations
  category?: BlogCategory
  tags?: BlogTag[]
  comments?: BlogComment[]
  likes?: BlogLike[]
  _count?: {
    comments: number
    likes: number
  }
}

export interface BlogCategory {
  id: string
  name: string
  slug: string
  description: string | null
  color: string
  icon: string | null
  order: number
  createdAt: Date
}

export interface BlogTag {
  id: string
  name: string
  slug: string
  createdAt: Date
}

export interface BlogComment {
  id: string
  content: string
  postId: string
  authorId: string
  authorName: string
  status: 'pending' | 'approved' | 'rejected'
  parentId: string | null
  createdAt: Date
  updatedAt: Date | null
  replies?: BlogComment[]
}

export interface BlogLike {
  userId: string
  postId: string
  createdAt: Date
}

// Form types
export interface CreateBlogPostInput {
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage?: string
  categoryId?: string
  tags?: string[]
  status: 'draft' | 'published'
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string
}

export interface UpdateBlogPostInput extends Partial<CreateBlogPostInput> {
  id: string
}

// Query filters
export interface BlogPostFilters {
  categoryId?: string
  tagId?: string
  status?: 'draft' | 'published' | 'archived'
  authorId?: string
  search?: string
  limit?: number
  offset?: number
  sortBy?: 'publishedAt' | 'viewCount' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}
```

---

## Feature Specifications

### 1. Admin Dashboard

#### Location: `/blog/admin`

**Purpose:** Central hub for managing blog content

**Features:**
- Dashboard overview with statistics
  - Total posts (draft, published, archived)
  - Total views
  - Recent comments
  - Popular posts
- Post management table
  - List all posts with filters
  - Quick actions (Edit, Delete, View, Duplicate)
  - Bulk actions (Delete, Change status)
  - Search and filter
- Category management
- Tag management

**Access Control:**
- Only admins (role-based via Clerk metadata)
- Redirect non-admins to blog listing

**UI Pattern:**
```
┌─────────────────────────────────────────┐
│  Blog Admin Dashboard                   │
├─────────────────────────────────────────┤
│  [New Post] [Categories] [Settings]     │
├─────────────────────────────────────────┤
│  Stats:                                 │
│  📝 15 Posts  👁️  2,453 Views           │
│  💬 47 Comments  ❤️  156 Likes          │
├─────────────────────────────────────────┤
│  Recent Posts:                          │
│  ┌───────────────────────────────────┐ │
│  │ Title | Category | Status | Views│ │
│  │ [Edit] [Delete] [View]           │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

### 2. Post Editor

#### Location: `/blog/admin/editor` (create) or `/blog/admin/editor/[id]` (edit)

**Purpose:** Rich content creation and editing interface

**Features:**
- **Rich Text Editor**
  - Lexical editor integration
  - Markdown shortcuts
  - Formatting toolbar (bold, italic, headings, lists, code)
  - Embed support (images, videos, code blocks)

- **Content Management**
  - Title input (auto-generates slug)
  - Slug editor (with validation)
  - Excerpt textarea (with character count)
  - Cover image upload/select
  - Category dropdown
  - Tags multi-select (with create new)

- **Publishing Options**
  - Draft/Publish toggle
  - Schedule publishing (future date)
  - Archive post

- **SEO Optimization**
  - Meta title (with character counter)
  - Meta description (with character counter)
  - Keywords (comma-separated)
  - Preview card simulation

- **Preview**
  - Side-by-side or fullscreen preview
  - Mobile/tablet/desktop preview modes

**Autosave:** Every 30 seconds to localStorage + database

**UI Pattern:**
```
┌─────────────────────────────────────────┐
│  ✏️  Edit Post          [Preview] [Save]│
├─────────────────────────────────────────┤
│  Title: ___________________________     │
│  Slug:  ___________________________     │
├─────────────────────────────────────────┤
│  ┌───────────────────────────────────┐ │
│  │ [B] [I] [H1] [H2] [List] [Code]  │ │
│  │                                   │ │
│  │ Content editor area...            │ │
│  │                                   │ │
│  └───────────────────────────────────┘ │
├─────────────────────────────────────────┤
│  Excerpt: ________________________      │
│  Cover Image: [Upload] [Select]         │
│  Category: [Dropdown]                   │
│  Tags: [Multi-select + Create]          │
├─────────────────────────────────────────┤
│  📋 SEO                                 │
│  Meta Title: ______________________     │
│  Meta Description: _________________    │
│  Keywords: _________________________    │
├─────────────────────────────────────────┤
│  [Save Draft] [Schedule] [Publish]      │
└─────────────────────────────────────────┘
```

---

### 3. Enhanced Blog Listing Page

#### Location: `/blog`

**Current:** Simple list with basic search
**Enhanced:** Advanced filtering, sorting, and organization

**New Features:**
- **Filtering Sidebar**
  - Filter by category (with post counts)
  - Filter by tag (multi-select)
  - Filter by date range
  - Sort options (newest, popular, trending)

- **Visual Improvements**
  - Category badges with colors
  - Cover images in cards
  - Reading time indicator
  - View count and like count
  - Author info with avatar
  - Hover animations

- **Layout Options**
  - Grid view (default, 3 columns)
  - List view (compact)
  - Featured posts section at top

- **Pagination**
  - Load more button
  - Infinite scroll option
  - Page numbers

**UI Pattern:**
```
┌─────────────────────────────────────────────────────┐
│  🩺 Blog Medyczny                                   │
├─────────────────────────────────────────────────────┤
│  [Search: _________________]  [Sort: Newest ▼]     │
├───────────────┬─────────────────────────────────────┤
│ Categories    │  ┌─────┐ ┌─────┐ ┌─────┐           │
│ □ Higiena (8) │  │ 🖼️   │ │ 🖼️   │ │ 🖼️   │           │
│ □ Dieta (5)   │  │ Post│ │ Post│ │ Post│           │
│ □ Etyka (3)   │  │ 1   │ │ 2   │ │ 3   │           │
│               │  └─────┘ └─────┘ └─────┘           │
│ Tags          │                                     │
│ #rehabilitacja│  ┌─────┐ ┌─────┐ ┌─────┐           │
│ #pierwsza-    │  │ 🖼️   │ │ 🖼️   │ │ 🖼️   │           │
│  pomoc        │  │ Post│ │ Post│ │ Post│           │
│               │  │ 4   │ │ 5   │ │ 6   │           │
│ [Clear]       │  └─────┘ └─────┘ └─────┘           │
├───────────────┴─────────────────────────────────────┤
│  [Load More Posts]            Page 1 of 5           │
└─────────────────────────────────────────────────────┘
```

---

### 4. Enhanced Blog Post Detail Page

#### Location: `/blog/[slug]`

**Current:** Basic title, date, content display
**Enhanced:** Rich media, engagement, and recommendations

**New Features:**
- **Hero Section**
  - Cover image (full-width or contained)
  - Category badge
  - Title (H1)
  - Author info (name, avatar, bio link)
  - Published date
  - Reading time
  - View count

- **Content Area**
  - MDX rendering with custom components
  - Syntax highlighting for code blocks
  - Image zoom/lightbox
  - Embedded media support
  - Table of contents (for long posts)

- **Engagement**
  - Like button (heart icon with count)
  - Share buttons (Twitter, Facebook, LinkedIn, Copy link)
  - Bookmark/Save feature

- **Comments Section**
  - Comment count
  - Threaded replies (1 level deep)
  - Like comments
  - Sort by (Newest, Oldest, Most liked)
  - Moderation notice for pending comments

- **Sidebar/Bottom**
  - Author bio card
  - Related posts (3-4 posts, same category or tags)
  - Popular posts widget
  - Newsletter signup CTA
  - Categories widget

**SEO:**
- Dynamic Open Graph tags
- Twitter Card meta tags
- JSON-LD structured data (Article schema)
- Canonical URL

**UI Pattern:**
```
┌─────────────────────────────────────────────────────┐
│  ┌───────────────────────────────────────────────┐ │
│  │           [Cover Image]                       │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  [Higiena] • John Doe • May 15, 2025 • 5 min read  │
│                                                     │
│  Podstawowe umiejętności opiekuna medycznego        │
│  ───────────────────────────────────────────────── │
│                                                     │
│  [Table of Contents]                                │
│  - Introduction                                     │
│  - Key Skills                                       │
│  - Conclusion                                       │
│                                                     │
│  Post content with rich formatting...               │
│  Images, code blocks, lists, etc.                   │
│                                                     │
│  ❤️ 24  💬 8  [Share ▼]                            │
│  ───────────────────────────────────────────────── │
│                                                     │
│  💬 Comments (8)                                    │
│  [Sort: Newest ▼]                                  │
│                                                     │
│  👤 User1: Great article!                          │
│     ↳ 👤 Author: Thanks!                           │
│                                                     │
│  ───────────────────────────────────────────────── │
│  Related Posts:                                     │
│  ┌─────┐ ┌─────┐ ┌─────┐                          │
│  │Post │ │Post │ │Post │                          │
│  └─────┘ └─────┘ └─────┘                          │
└─────────────────────────────────────────────────────┘
```

---

### 5. Category Pages

#### Location: `/blog/category/[slug]`

**Purpose:** Dedicated pages for each category

**Features:**
- Category header (name, description, icon, color)
- Filtered post list (posts in this category)
- Subcategory navigation (if implemented)
- Related categories
- SEO meta tags

---

### 6. Tag Pages

#### Location: `/blog/tag/[slug]`

**Purpose:** Dedicated pages for each tag

**Features:**
- Tag header (name, post count)
- Filtered post list (posts with this tag)
- Related tags cloud
- SEO meta tags

---

### 7. Search Results Page

#### Location: `/blog/search?q=[query]`

**Purpose:** Dedicated search results page

**Features:**
- Search query display
- Result count
- Filter results by category/tag
- Highlighted search terms in results
- Suggestions for no results

---

### 8. RSS Feed

#### Location: `/blog/rss.xml`

**Purpose:** RSS feed for blog subscribers

**Features:**
- Valid RSS 2.0 format
- Last 50 published posts
- Full content or excerpt (configurable)
- Category information
- Proper encoding

---

### 9. Sitemap

#### Location: `/blog/sitemap.xml`

**Purpose:** Dynamic sitemap for SEO

**Features:**
- All published blog posts
- Category pages
- Tag pages
- Priority and change frequency
- Last modified dates

---

## Server Actions & API Routes

### Blog Post Actions

```typescript
// /src/server/actions/blog.ts

export async function createBlogPost(input: CreateBlogPostInput): Promise<{ success: boolean; data?: BlogPost; error?: string }>

export async function updateBlogPost(input: UpdateBlogPostInput): Promise<{ success: boolean; data?: BlogPost; error?: string }>

export async function deleteBlogPost(id: string): Promise<{ success: boolean; error?: string }>

export async function publishBlogPost(id: string): Promise<{ success: boolean; error?: string }>

export async function archiveBlogPost(id: string): Promise<{ success: boolean; error?: string }>

export async function incrementViewCount(id: string): Promise<void>

export async function likeBlogPost(postId: string, userId: string): Promise<{ success: boolean; error?: string }>

export async function unlikeBlogPost(postId: string, userId: string): Promise<{ success: boolean; error?: string }>
```

### Comment Actions

```typescript
// /src/server/actions/blogComments.ts

export async function createBlogComment(postId: string, content: string, parentId?: string): Promise<{ success: boolean; data?: BlogComment; error?: string }>

export async function deleteBlogComment(id: string): Promise<{ success: boolean; error?: string }>

export async function updateBlogCommentStatus(id: string, status: 'approved' | 'rejected'): Promise<{ success: boolean; error?: string }>
```

### Category & Tag Actions

```typescript
// /src/server/actions/blogCategories.ts

export async function createCategory(input: { name: string; slug: string; description?: string; color?: string }): Promise<{ success: boolean; data?: BlogCategory; error?: string }>

export async function updateCategory(id: string, input: Partial<BlogCategory>): Promise<{ success: boolean; error?: string }>

export async function deleteCategory(id: string): Promise<{ success: boolean; error?: string }>

// /src/server/actions/blogTags.ts

export async function createTag(input: { name: string; slug: string }): Promise<{ success: boolean; data?: BlogTag; error?: string }>

export async function deleteTag(id: string): Promise<{ success: boolean; error?: string }>
```

---

## Query Functions

```typescript
// /src/server/queries/blog.ts

export const getAllBlogPosts = cache(async (filters?: BlogPostFilters): Promise<BlogPost[]>)

export const getBlogPostBySlug = cache(async (slug: string): Promise<BlogPost | null>)

export const getBlogPostById = cache(async (id: string): Promise<BlogPost | null>)

export const getFeaturedBlogPosts = cache(async (limit: number = 3): Promise<BlogPost[]>)

export const getRelatedBlogPosts = cache(async (postId: string, limit: number = 4): Promise<BlogPost[]>)

export const getPopularBlogPosts = cache(async (limit: number = 5): Promise<BlogPost[]>)

export const searchBlogPosts = cache(async (query: string): Promise<BlogPost[]>)

export const getBlogCategories = cache(async (): Promise<BlogCategory[]>)

export const getBlogTags = cache(async (): Promise<BlogTag[]>)

export const getBlogComments = cache(async (postId: string): Promise<BlogComment[]>)

export const getBlogStatistics = cache(async (): Promise<{
  totalPosts: number
  totalViews: number
  totalComments: number
  totalLikes: number
}>)
```

---

## Utility Functions

### Reading Time Calculator

```typescript
// /src/lib/blogUtils.ts

export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const wordCount = content.split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}
```

### Slug Generator

```typescript
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove duplicate hyphens
}
```

### Related Posts Algorithm

```typescript
export async function getRelatedPosts(
  postId: string,
  categoryId: string | null,
  tags: string[],
  limit: number = 4
): Promise<BlogPost[]> {
  // Algorithm:
  // 1. Posts with same category (weight: 3)
  // 2. Posts with matching tags (weight: 1 per tag)
  // 3. Order by total weight DESC
  // 4. Exclude current post
  // 5. Limit results
}
```

---

## Validation Schemas (Zod)

```typescript
// /src/lib/validations/blog.ts

export const createBlogPostSchema = z.object({
  title: z.string().min(5).max(256),
  slug: z.string().min(5).max(256).regex(/^[a-z0-9-]+$/),
  excerpt: z.string().min(50).max(500),
  content: z.string().min(100),
  coverImage: z.string().url().optional(),
  categoryId: z.string().uuid().optional(),
  tags: z.array(z.string()).max(10).optional(),
  status: z.enum(['draft', 'published']),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  metaKeywords: z.string().max(256).optional(),
})

export const updateBlogPostSchema = createBlogPostSchema.partial().extend({
  id: z.string().uuid(),
})

export const createCommentSchema = z.object({
  content: z.string().min(3).max(1000),
  postId: z.string().uuid(),
  parentId: z.string().uuid().optional(),
})

export const createCategorySchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  icon: z.string().max(50).optional(),
})

export const createTagSchema = z.object({
  name: z.string().min(2).max(50),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
})
```

---

## Component Structure

```
/src/app/blog/
├── page.tsx                          # Enhanced listing page
├── [slug]/page.tsx                   # Enhanced post detail
├── category/[slug]/page.tsx          # Category page
├── tag/[slug]/page.tsx               # Tag page
├── search/page.tsx                   # Search results
├── admin/
│   ├── layout.tsx                    # Admin layout with nav
│   ├── page.tsx                      # Dashboard
│   ├── editor/
│   │   ├── page.tsx                  # Create post
│   │   └── [id]/page.tsx            # Edit post
│   ├── categories/page.tsx           # Category management
│   └── tags/page.tsx                 # Tag management
└── rss.xml/route.ts                  # RSS feed

/src/components/blog/
├── BlogCard.tsx                      # Post card (grid view)
├── BlogListItem.tsx                  # Post item (list view)
├── BlogFilters.tsx                   # Sidebar filters
├── BlogCategoryBadge.tsx             # Category badge
├── BlogTagList.tsx                   # Tag cloud
├── BlogHero.tsx                      # Hero section (reuse/enhance)
├── BlogTOC.tsx                       # Table of contents
├── BlogComments.tsx                  # Comments section
├── BlogCommentForm.tsx               # Comment form
├── BlogCommentItem.tsx               # Single comment
├── BlogLikeButton.tsx                # Like button
├── BlogShareButtons.tsx              # Social share
├── BlogRelatedPosts.tsx              # Related posts widget
├── BlogPopularPosts.tsx              # Popular posts widget
├── BlogReadingProgress.tsx           # Reading progress bar
└── BlogSearchBar.tsx                 # Search component

/src/components/blog/admin/
├── AdminDashboard.tsx                # Dashboard overview
├── AdminPostList.tsx                 # Post management table
├── AdminPostEditor.tsx               # Rich text editor
├── AdminCategoryList.tsx             # Category management
├── AdminTagList.tsx                  # Tag management
└── AdminStats.tsx                    # Statistics cards
```

---

## Migration Strategy

### Phase 1: Database Setup (Day 1)
1. ✅ Create enhanced database schema
2. ✅ Run migrations
3. ✅ Seed initial categories
4. ✅ Migrate existing JSON posts to database

### Phase 2: Core Functionality (Days 2-3)
1. ✅ Implement CRUD server actions
2. ✅ Create query functions
3. ✅ Build admin dashboard layout
4. ✅ Build post editor with Lexical

### Phase 3: Public Features (Days 4-5)
1. ✅ Enhance blog listing page
2. ✅ Enhance blog detail page
3. ✅ Implement comments system
4. ✅ Add likes and sharing

### Phase 4: Advanced Features (Days 6-7)
1. ✅ Category and tag pages
2. ✅ Search functionality
3. ✅ Related posts algorithm
4. ✅ RSS feed
5. ✅ SEO enhancements

### Phase 5: Testing & Polish (Day 8)
1. ✅ End-to-end testing
2. ✅ Performance optimization
3. ✅ Mobile responsiveness
4. ✅ Accessibility audit

---

## SEO Optimization

### Meta Tags Template

```typescript
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getBlogPostBySlug(params.slug)

  if (!post) return {}

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    keywords: post.metaKeywords,
    authors: [{ name: post.authorName }],
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      authors: [post.authorName],
      images: post.coverImage ? [{ url: post.coverImage }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      images: post.coverImage ? [post.coverImage] : [],
    },
  }
}
```

### JSON-LD Structured Data

```typescript
export function generateBlogPostSchema(post: BlogPost) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      '@type': 'Person',
      name: post.authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Wolfmed Edukacja',
      logo: {
        '@type': 'ImageObject',
        url: 'https://wolfmed.edu/logo.png',
      },
    },
  }
}
```

---

## Performance Optimization

### Caching Strategy

1. **Server-side:**
   - React `cache()` for query functions
   - Static generation for published posts
   - ISR (revalidate every 3600s) for blog listing

2. **Client-side:**
   - TanStack Query with 10-minute stale time
   - Optimistic updates for likes/comments
   - Prefetch on hover for post cards

3. **Database:**
   - Indexed queries (see schema indexes)
   - Pagination with offset/limit
   - Select only needed fields

### Image Optimization

- Use Next.js `<Image>` component
- Generate multiple sizes (thumbnail, medium, large)
- Lazy load images below fold
- Use WebP format with fallback

---

## Analytics & Tracking

### Metrics to Track

1. **Post Performance:**
   - View count (stored in DB)
   - Reading completion rate (client-side)
   - Like count
   - Comment count
   - Share count

2. **User Engagement:**
   - Time on page
   - Scroll depth
   - Bounce rate
   - Click-through rate from listing

3. **Admin Insights:**
   - Most popular posts
   - Most commented posts
   - Category popularity
   - Tag usage

---

## Security Considerations

### Admin Access Control

```typescript
// Middleware for admin routes
export async function checkAdminAccess(userId: string): Promise<boolean> {
  const user = await clerkClient.users.getUser(userId)
  return user.publicMetadata.role === 'admin'
}
```

### Rate Limiting

- Comments: 5 per minute per user
- Likes: 10 per minute per user
- Post creation: Admin only, no rate limit

### Content Sanitization

- Sanitize user input (comments)
- Validate HTML in rich text
- Escape special characters
- Prevent XSS attacks

---

## Accessibility (WCAG 2.1 AA)

1. **Semantic HTML:** Use proper heading hierarchy (H1 → H2 → H3)
2. **Keyboard Navigation:** All interactive elements accessible via keyboard
3. **ARIA Labels:** Proper labels for buttons, forms, icons
4. **Color Contrast:** Minimum 4.5:1 for text
5. **Alt Text:** All images have descriptive alt text
6. **Focus Indicators:** Visible focus states
7. **Screen Reader Support:** Meaningful announcements

---

## Future Enhancements (Post-Launch)

1. **Multimedia:** Video embeds, audio players, slideshows
2. **Newsletters:** Email subscription and digest
3. **Series/Collections:** Group related posts
4. **Co-authoring:** Multiple authors per post
5. **Versioning:** Track post revisions
6. **Translations:** Multi-language support
7. **Advanced Analytics:** Integration with Google Analytics 4
8. **Content Recommendations:** ML-based recommendations
9. **Editorial Workflow:** Review/approval process
10. **API:** Public API for third-party integrations

---

## Testing Checklist

### Unit Tests
- [ ] Server actions (create, update, delete)
- [ ] Query functions
- [ ] Utility functions (slug generation, reading time)
- [ ] Validation schemas

### Integration Tests
- [ ] Blog post CRUD flow
- [ ] Comment creation and deletion
- [ ] Category and tag management
- [ ] Search functionality

### E2E Tests
- [ ] Create and publish post as admin
- [ ] View post as visitor
- [ ] Add comment as authenticated user
- [ ] Like post
- [ ] Filter by category/tag
- [ ] Search posts

### Performance Tests
- [ ] Page load time < 2s
- [ ] Time to interactive < 3s
- [ ] Large post rendering (10,000+ words)
- [ ] Many comments rendering (100+)

### Accessibility Tests
- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] Color contrast
- [ ] ARIA labels

---

## Deployment Checklist

- [ ] Run database migrations
- [ ] Seed initial categories
- [ ] Migrate existing posts
- [ ] Test in staging environment
- [ ] Update environment variables
- [ ] Clear build cache
- [ ] Deploy to production
- [ ] Submit sitemap to search engines
- [ ] Monitor error logs
- [ ] Verify RSS feed
- [ ] Test all features in production

---

## Conclusion

This design document provides a comprehensive blueprint for transforming the Wolfmed blog into a modern, feature-rich medical education content platform. The implementation prioritizes:

1. **User Experience:** Intuitive navigation, fast loading, engaging content
2. **Content Management:** Powerful admin tools for easy publishing
3. **SEO:** Optimized for discoverability and search rankings
4. **Engagement:** Comments, likes, sharing to build community
5. **Performance:** Static generation, caching, optimization
6. **Accessibility:** Inclusive design for all users
7. **Scalability:** Database-backed, ready to grow

The phased implementation approach ensures steady progress with testable milestones. Each feature builds on the existing infrastructure (Drizzle ORM, Clerk auth, TanStack Query) to maintain consistency across the platform.

**Estimated Development Time:** 7-8 days for full implementation
**Estimated Launch Date:** 2 weeks after start (including testing)

---

*Document Version 1.0 - Ready for Implementation*
