# Business Flow: Social & Admin Content

[← Back to index](./README.md)

---

## Flow 1 — User posts on the forum and gets replies

1. `/forum` → `CreatePostButton` modal → submits `createForumPostAction` (`src/actions/actions.ts:496`).
2. Rate-limited (5 posts/hour, `forum:post:create`), validated (`CreatePostSchema`).
3. `authorRole` is derived **server-side** from the session claim (`sessionClaims.metadata.role === 'admin' ? 'admin' : 'user'`) — never trusted from the client, so a regular user cannot submit a post that displays with admin styling/authority.
4. Inside a transaction: looks up the poster's current `username` from `users` (so the post always shows an up-to-date display name, not a stale client-cached one) and inserts the `forumPosts` row via `createForumPost()`.
5. `revalidatePath('/forum')`.
6. **Another user comments**: `createCommentAction` (`:610`) — rate-limited (20/hour), validated (`CreateCommentSchema`). Inside a transaction, checks **both** that the target post still exists **and** that it isn't `readonly` before inserting — a comment attempt on a locked or deleted thread fails with a specific message rather than silently succeeding or throwing a generic error.
   - **`readonly` is not an admin moderation tool** — corrected from an earlier (inaccurate) pass of this doc set that called it "admin-lockable." It's a plain checkbox ("Wyłącz komentarze") on `CreatePostForm.tsx`, submitted straight through `createForumPostAction` with no role check anywhere in the path — **any signed-in user can disable comments on their own post at creation time**, and there is no action anywhere in the codebase to lock/unlock a thread after the fact (not by its author, not by an admin). If comment-locking is meant to be an admin capability, that's a product gap, not just a doc one.
7. **Author deletes their own post**: `deletePostAction` (`:574`) accepts only a validated `postId`; `deleteForumPost(postId, userId)` atomically deletes only where the database row's `authorId` matches the authenticated user. Comment deletion uses the same server-authoritative pattern and permits either the comment author or parent-post author, matching the rendered controls. Missing and unauthorized records return the same error.
8. **Unread notifications**: `markForumSeenAction(scope)` (`src/actions/forum-notifications.ts:13`) is fired automatically by `<MarkForumSeen>` when a user actually views `/forum` or `/forum/[postId]` (not a user-initiated action). It upserts `forumReadState.lastSeenPostsAt` or `lastSeenCommentsAt` depending on `scope` — with a specific care taken on first insert: the **other** (untouched) column is seeded to `FORUM_NOTIFICATIONS_EPOCH` rather than "now," because defaulting it to the current timestamp would silently mark the *other* notification type as already-seen even though the user never looked at it.

**Files**: `src/actions/actions.ts`, `src/actions/forum-notifications.ts`, `src/constants/forumNotifications.ts`.

---

## Flow 2 — User likes a blog post

1. `/blog/[slug]` → `<BlogLikeButton />` hydrates its initial like state client-side on mount via `getBlogLikeState(postId)` (`src/actions/blog.ts:537`) — the post page itself is cacheable/user-agnostic (per root `CLAUDE.md` → "❤️ Blog Likes"), so per-user like state can't be baked into the server-rendered page.
2. Click → `toggleBlogLikeAction` (`:457`) — rate-limited (`blog:like`), validated (`LikeBlogPostSchema`).
3. **Toggle, not two separate actions**: checks for an existing `blogLikes` row for `(postId, userId)`; deletes it if present, inserts it if absent. This makes the action idempotent against a double-click or a stale client retry — either outcome converges to the same DB state a second identical request would produce.
4. Re-counts likes for the post (`count()` query) and returns the fresh `{ liked, count }` in `FormState.values` — the client updates its like button and count directly from this response rather than re-fetching the whole page.

**Files**: `src/actions/blog.ts`.

---

## Flow 3 — User submits the contact form (and an admin reads it)

Covered in detail in [`10-pages-public.md`](./10-pages-public.md) → Contact form flow and [`13-pages-admin.md`](./13-pages-admin.md) → Messages. Summary as a flow: `sendEmail` (rate-limited 3/hour) validates and inserts into `customersMessages`; an admin later reads the paginated list at `/admin/messages` and calls `markMessageAsReadAction` to clear it.

---

## Flow 4 — Admin publishes a blog post

1. `/admin/posts/new` → `<BlogPostForm mode="create" />` → submits `createBlogPostAction` (`src/actions/blog.ts:21`).
2. **Role re-checked inside the action itself**, independent of the `admin/layout.tsx` gate (`sessionClaims.metadata.role !== 'admin'` → `Unauthorized`) — every blog/category/tag action in this file follows this same defense-in-depth pattern (see [`13-pages-admin.md`](./13-pages-admin.md) → Admin server actions).
3. Validates (`CreateBlogPostSchema`), computes `readingTime` server-side (`calculateReadingTime()`, `src/helpers/blogUtils.ts`) from the actual content rather than trusting a client-submitted estimate.
4. Inserts the `blogPosts` row. **If created directly with `status: 'published'`, `publishedAt` is set immediately** — publishing can happen at creation time, not only via the separate publish action below. Tag checkboxes (`formData.getAll('tags')`) become `blogPostTags` join rows in a second insert.
5. Revalidates `/blog`, `/admin`, `/admin/posts`.
6. **Publishing a draft later**: `publishBlogPostAction` (`:259`) — same admin re-check, sets `status: 'published'` and `publishedAt` (defaulting to now, or an explicitly backdated/scheduled value if the admin supplied one via the form — the schema accepts an optional `publishedAt`).
7. **Archiving**: `archiveBlogPostAction` (`:303`) — sets `status: 'archived'`; the post drops out of the public `/blog` list (which filters `status: 'published'`, see [`10-pages-public.md`](./10-pages-public.md)) without being deleted.

**Files**: `src/actions/blog.ts`, `src/helpers/blogUtils.ts`, `src/components/admin/BlogPostForm.tsx`.

---

## Flow 5 — Admin sets up and manages the RAG corpus

The operational flow behind the "Curriculum — the corpus" data-source tier (root `CLAUDE.md` → Data Sources).

1. `/admin/rag`, uninitialized state → `<CreateStoreSection />` → `createFileSearchStoreAction` (`src/actions/admin-rag-actions.ts:23`, `ensureAdmin()`-gated). Calls `createCorpus(displayName)` (`src/server/vertex-rag/corpus.ts`), then **reads the corpus back** (`getCorpus(storeName)`) rather than trusting the requested embedding model — the inline comment notes Vertex RAG Engine can silently substitute a fallback model when it rejects the one requested, and `rag_config` needs to describe the corpus that actually exists (retrieval-quality debugging depends on this being accurate). Persists via `setRagConfig()` → `ragConfig` table.
2. Once configured, `<UploadDocsSection />` → `uploadFilesAction` — restricts to `.md`/`.txt`/`.pdf`, calls `uploadFiles(storeName, files)`, `revalidatePath('/admin/rag')`.
3. `<DocumentListTable />` reads back via `listStoreDocumentsAction` (a live call to `listCorpusFiles()`, not a local cache — the admin always sees the corpus's actual current state).
4. `<TestQueryForm />` → `testRagQueryAction` — runs `retrieveContext({ mode: 'canonical_only' })` + `generateGroundedAnswer()`, **the exact same production path** the student-facing tutor uses (see [`33-flows-ai-tutor.md`](./33-flows-ai-tutor.md) → Flow C), so a green result here is a genuine signal the corpus is answering correctly, not a simulated check. `canonical_only` specifically excludes the admin's own personal library, so the probe reflects what *any* student would get, not something skewed by the admin's own notes.
5. `deleteFileSearchStoreAction` tears down both the Vertex corpus (`deleteCorpus`) and the `ragConfig` row — a full reset, used when re-provisioning the corpus from scratch.

**Files**: `src/actions/admin-rag-actions.ts`, `src/server/vertex-rag/`, `src/server/rag-queries.ts`, `src/helpers/ensureAdmin.ts`.
