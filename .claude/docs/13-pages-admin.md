# Admin Pages

[← Back to index](./README.md)

All routes under `src/app/admin/` are gated by `src/app/admin/layout.tsx` → `await requireAdmin()` (Clerk session claim `metadata.role === 'admin'`, redirects to `/` otherwise — see [`00-architecture.md`](./00-architecture.md) → Auth model). The layout also renders `AdminNavBadged` (desktop + mobile variants, each independently suspended) and a "← Powrót do Bloga" link. `metadata.robots = 'noindex, nofollow'` throughout this section.

> **Audit note**: several pages in this section (`admin/categories/page.tsx`, `admin/categories/new/page.tsx`, `admin/posts/new/page.tsx`, `admin/tags/*`) inline breadcrumb/header JSX directly in `page.tsx` rather than extracting it to a component, which is a deviation from Golden Rule #2 ("page.tsx is a shell, not a screen"). Flagged here rather than silently normalized — see [`17` finalize step / README audit summary].

---

## `/admin` — Admin dashboard

**File**: `src/app/admin/page.tsx`. Single suspended `AsyncAdminDashboard` fetches, in parallel: `getBlogStatistics()`, `getAllBlogPosts({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' })`, `getMessageStats()`, `getForumStats()`, `getRecentForumPosts(5)` — all feeding one `<AdminBlogPanel />` overview widget (blog + messages + forum stats in one glance).

## `/admin/categories` — Blog categories & tags management

**File**: `src/app/admin/categories/page.tsx`. Fetches `getBlogCategories()` + `getBlogTags()` in parallel; renders both lists inline (see audit note above) with edit links to `/admin/categories/[id]/edit` and `/admin/tags/[id]/edit`, plus "create new" links.

## `/admin/categories/new`, `/admin/categories/[id]/edit`

Both render `<CategoryForm mode="create" | "edit" category={...} />` (`src/components/admin/CategoryForm.tsx`) — the shared form component for both modes, following the create/edit-via-`mode`-prop pattern used throughout admin. Edit variant 404s (`notFound()`) if `getBlogCategoryById(id)` returns nothing.

## `/admin/tags/new`, `/admin/tags/[id]/edit`

Same pattern via `<TagForm mode="create" | "edit" tag={...} />` (`src/components/admin/TagForm.tsx`).

## `/admin/posts` — Blog posts management

**File**: `src/app/admin/posts/page.tsx`. `getAllBlogPosts({ limit: 100, sortBy: 'createdAt' })` → `<PostsManagementContent posts={...} />` (client-side table/filtering component).

## `/admin/posts/new`, `/admin/posts/[id]/edit`

Both fetch `getBlogCategories()` + `getBlogTags()` (needed for the post's category/tag pickers); edit also fetches `getBlogPostById(id)` (`notFound()` if missing). Both render `<BlogPostForm mode="create" | "edit" post={...} categories={...} tags={...} />` (`src/components/admin/BlogPostForm.tsx`) — the Lexical rich-text post editor, SEO fields, publish status.

## `/admin/forum` — Forum moderation

**File**: `src/app/admin/forum/page.tsx`. Paginated (`?page=`, page size `ADMIN_FORUM_PAGE_SIZE` from `@/constants/forumNotifications`), three independent Suspense boundaries: `AsyncForumStats` (`getForumStats()`), `AsyncForumPosts` (`getRecentForumPosts(pageSize, offset)` + `getForumStats()` for total-pages, keyed by `currentPage` so React remounts the Suspense boundary on page change), and a `ForumSeenMarker` clearing the admin's own unread-posts badge — same `MarkForumSeen` component used on the public `/forum` page.

## `/admin/messages` — Contact form messages

**File**: `src/app/admin/messages/page.tsx`. Paginated (`?page=`, page size 20). `getAllMessages(page, 20)` → `<MessageManagement initialMessages initialPagination />`. This is the read/reply side of the `sendEmail` action from the home page's `ContactForm` (see [`10-pages-public.md`](./10-pages-public.md)) — reads the `customersMessages` table.

## `/admin/rag` — RAG system management

**File**: `src/app/admin/rag/page.tsx`. The only admin surface that touches the Vertex AI corpus directly (`src/server/vertex-rag/`, see [`00-architecture.md`](./00-architecture.md)):
1. `getStoreStatusAction()` + `listStoreDocumentsAction()` (`src/actions/admin-rag-actions.ts`) in parallel.
2. If **not configured** (`storeStatus.data.isConfigured` false) → renders `<CreateStoreSection />` only (bootstraps a new File Search Store / corpus — writes to the `ragConfig` table, see schema doc).
3. If **configured** → `<UploadDocsSection storeName />` (ingest new curriculum documents), `<DocumentListTable documents={...} />` (what's currently indexed), and `<TestQueryForm storeName />` — lets an admin run a probe query against the corpus directly, independent of any student-facing feature, to sanity-check retrieval quality.

**No single-document removal**: `admin-rag-actions.ts` has no "delete this one document" action — `DocumentListTable` is read-only, and the only deletion capability is `deleteFileSearchStoreAction`, which tears down the **entire** corpus and `ragConfig` row (see [`21-server-actions.md`](./21-server-actions.md)). Removing one bad document from the curriculum currently means rebuilding the whole store — worth knowing before uploading anything an admin might later want to retract individually.

This page is the operational front-end for the "Curriculum — the corpus" tier described in root `CLAUDE.md` → Data Sources.

---

## Admin server actions

Blog/category/tag/post CRUD goes through the corresponding action files ([`21-server-actions.md`](./21-server-actions.md)): `src/actions/blog.ts`, `src/actions/blogCategories.ts` (each function re-checks `sessionClaims.metadata.role` via `auth()` itself). RAG management goes through `src/actions/admin-rag-actions.ts` (store status, document upload, document listing, `testRagQueryAction`, `deleteFileSearchStoreAction`) — every exported function starts with `await ensureAdmin()` (`src/helpers/ensureAdmin.ts`, throws `Unauthorized` if `sessionClaims.metadata.role !== 'admin'`). This is a deliberate defense-in-depth pattern: the `admin/layout.tsx` gate stops a non-admin from ever rendering the page, and the action-level check stops the mutation even if the Server Action endpoint were invoked directly, bypassing the page.

`testRagQueryAction` is worth noting specifically: it calls `retrieveContext({ mode: 'canonical_only' })` — deliberately excluding the admin's own personal library — so the probe result reflects exactly what the corpus alone would return for a student (see the inline comment in the source, and root `CLAUDE.md` → Retrieval rules).
