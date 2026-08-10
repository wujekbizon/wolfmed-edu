# Database Schema

[← Back to index](./README.md)

Postgres (Neon serverless, `@neondatabase/serverless` over a WebSocket pool) via Drizzle ORM. Client: `src/server/db/index.ts` — exports `db`, a pooled `drizzle()` instance (`max: 3` connections), built from `NEON_DATABASE_URL`.

Every table name is created through `pgTableCreator((name) => \`wolfmed_${name}\`)`, so every physical table is prefixed `wolfmed_*`. This is declared three times (`schema.ts`, `library-schema.ts`, `memory-schema.ts`) with the same prefix to avoid a circular import — `schema.ts` re-exports the other two (`export * from "./memory-schema"` / `"./library-schema"`) so Drizzle Kit and the ORM see every table from one entry point.

Three files make up the schema:

| File | Contents |
|---|---|
| `src/server/db/schema.ts` | Core product schema — users, payments, tests, procedures, blog, forum, notes, courses, planner, diagnozy |
| `src/server/db/library-schema.ts` | Personal library chunk store (`wolfmed_lib_chunks`) — one table |
| `src/server/db/memory-schema.ts` | AI tutor memory layer (`wolfmed_mem_*`) — 6 tables |

Both `library-schema.ts` and `memory-schema.ts` require the Postgres `vector` and `pg_trgm` extensions (`pnpm run db:memory:extensions` before first `db:push`).

---

## Core product schema (`schema.ts`)

### `users` (`wolfmed_users`)
The account record, keyed by Clerk's `userId` (not the Postgres `id`). Tracks test-taking aggregates (`testsAttempted`, `totalScore`, `totalQuestions`), a free-text `motto`, `supporter` flag, and `stripeCustomerId` for billing lookups. `testLimit` gates how many tests a non-premium account may take.

### Payments & subscriptions
- **`payments`** (`stripe_payments`) — one row per completed Stripe Checkout session (one-time course purchases). Indexed by `userId`, `paymentStatus`, `createdAt`, `stripeCustomerId`.
- **`subscriptions`** (`stripe_subscriptions`) — one row per user's active subscription (`userId` unique). Holds `subscriptionId`, `invoiceId`, `courseSlug`.
- **`processedEvents`** (`processed_events`) — Stripe webhook idempotency ledger; `eventId` is unique so a replayed webhook is a no-op.
- **`currencyEnum`** — `pln | usd | eur`, shared by both payment tables.

### Tests & sessions
- **`tests`** — the question bank. `meta: { course, category }` (typed via local `TestMeta` interface) + `data` (jsonb question array).
- **`userCustomTests`** — a user-authored test (see `panel/dodaj-test`), same `meta`/`data` shape, scoped by `userId`.
- **`userCustomCategories`** — user-defined category grouping a set of `questionIds`; `linkedCategory` optionally maps it to a real curriculum subject for planner attribution.
- **`testSessions`** (`test_sessions`) — a timed attempt in progress: `category`, `numberOfQuestions`, `durationMinutes`, `expiresAt`, `lastActivityAt` (heartbeat target), `status: ACTIVE | EXPIRED | COMPLETED | CANCELLED`.
- **`completedTestes`** (`completed_tests`) — the finished result: `score`, `testResult` (jsonb), FK to both `users.userId` and `testSessions.id` (cascade delete on both).

### Procedures & courses
- **`procedures`** — single table for every course's procedural-learning content. `course` + `slug` identify it; `data` (jsonb) holds the full procedure body. `data.meta` mirrors the `course`/`slug` columns for convenience, but the columns are the query-side source of truth. Seeded from `data/procedures.json` via `scripts/seed-procedures.ts`.
- **`courses`** — the multi-course catalog (`slug`, `name`, `isActive`).
- **`courseEnrollments`** — links a user to a course with an `accessTier` (`basic` default) and optional `expiresAt`.
- **`challengeCompletions`** — a scored attempt at a procedure's practice challenge (quiz/recognition/etc.): `score`, `timeSpent`, `attempts`, `passed`.
- **`procedureBadges`** — an earned badge per completed procedure (`badgeImageUrl`, `earnedAt`).

### Diagnozy (nursing diagnosis modules)
- **`diagnozy`** — content table: `course`, `slug`, `section`, `chapterNumber/Title`, `title`, `data: Diagnoza` (typed jsonb, see `@/types/diagnozyTypes`).
- **`diagnozyProgress`** — one row per user per completed `diagnozaSlug` (unique on `userId + diagnozaSlug`).
- **`diagnozyExamAttempts`** — a scored practical-exam attempt over diagnozy content: `score`, `stepScores` (jsonb), `timeSpent`, `passed`.

### Blog
- **`blogCategories`**, **`blogTags`** — simple lookup tables (`name`, `slug`, plus `color`/`icon`/`order` on categories).
- **`blogPosts`** — full CMS post: `slug`, `excerpt`, `content`, `coverImage`, `categoryId` FK (`set null` on delete), `authorId/authorName`, `status: draft | published | archived` (`blogStatusEnum`), `publishedAt`, SEO fields (`metaTitle`, `metaDescription`, `metaKeywords`), `viewCount`, `readingTime`.
- **`blogPostTags`** — many-to-many join (`postId` + `tagId`, cascade both directions).
- **`blogLikes`** — composite `(userId, postId)`, cascade delete on post. Backs the like/unlike feature (see `.claude/docs/10-pages-public.md` → Blog).
- Relations: `blogPostsRelations` (one category, many tags, many likes), `blogCategoriesRelations`, `blogTagsRelations`, `blogPostTagsRelations`, `blogLikesRelations`.

### Forum
- **`forumPosts`** — `title`, `content`, `authorId/authorName/authorRole`, `readonly` (comments disabled — set by **any author at creation time** via a checkbox on the create-post form, not an admin moderation action; see [`34-flows-social-admin.md`](./34-flows-social-admin.md)).
- **`forumComments`** — `content`, FK to `forumPosts` (cascade) and `users` (cascade).
- **`forumReadState`** — one row per user (`userId` is the PK): `lastSeenPostsAt`, `lastSeenCommentsAt`, drives unread-badge logic.
- Relations: `forumPostsRelations` (many comments), `forumCommentsRelations` (one post).

### Testimonials
- **`testimonials`** — `content`, `rating` (real, default 5), `visible` flag, FK to `users`. `testimonialsRelations` / `usersRelations` link them via a named relation (`testimonialsAuthor`).

### Contact messages
- **`customersMessages`** (table name `messages`) — `email`, `message`, `isRead` (boolean, default `false`), no FK to `users` (the home-page contact form is reachable by any signed-in user, but the row only stores the email they typed, not their `userId`). Written by `sendEmail` (see [`10-pages-public.md`](./10-pages-public.md) → Contact form flow); read/marked-read from `/admin/messages` via `markMessageAsReadAction` (see [`13-pages-admin.md`](./13-pages-admin.md)).

### Study materials & library
- **`notes`** — rich-text (Lexical) note: `content` (jsonb Lexical tree), `plainText`, `excerpt`, `category`, `tags` (jsonb array), `pinned`.
- **`userCellsList`** — a user's mind-map/flowcharting cell layout: `cells` (jsonb) + `order` (jsonb), one row per user.
- **`materials`** — an uploaded file (UploadThing): `key` (unique), `url`, `type`, `category`, `size`, `extractedText` (text pulled once at upload time — everything downstream reads this instead of re-downloading/re-encoding), `indexStatus: pending | indexed | unindexable | failed` (drives the personal-library embedding sweep).
- **`userLimits`** — one row per user: `storageLimit` (default 20,000,000 bytes / 20 MB), `storageUsed`. This is the hard cap referenced throughout the CLAUDE.md cost-boundary rules.
- **`flashcardDecks`** / **`flashcards`** — a deck (`sourceType: ai | manual | note`, unique on `userId + sourceRef` so a note/AI-source can only spawn one deck) containing ordered cards (`position`).

### Multi-course access
Covered above under Procedures & courses (`courses`, `courseEnrollments`).

### Learning planner
- **`learningPlans`** — a study plan: `courseSlug`, `goalType`, `focusCategoryKey`, `dueDate`, `minutesPerDay`, `studyDays` (jsonb `number[]`, days of week), `status: active | ...`.
- **`learningPlanConcepts`** — an ordered concept/topic within a plan (`categoryKey` or `procedureId`, `targetMinutes`, `sortOrder`, `completedAt`).
- **`studyLogs`** — a logged study session (`minutes`, `note`, `source: manual | ...`), optionally tied to a plan/concept.
- Relations: `learningPlansRelations` (many concepts, many studyLogs), `learningPlanConceptsRelations`, `studyLogsRelations`.

### AI-generated content
- **`lectures`** — AI-generated audio lecture: `contentHash` (dedup key), `audioKey/audioUrl` (UploadThing), `size` (bytes charged/refunded against quota), `scriptText`, `duration`. Existing rows receive `size: 0`; newly generated lectures persist their real byte size.
- **`generatedPracticalExams`** — AI-generated practical exam (`examJson`), scoped by `userId`.
- **`generatedQuizzes`** — AI-generated quiz for a procedure challenge (`procedureId`, `challengeType`, `quizJson`).

### RAG config
- **`ragConfig`** — singleton-ish table (one row per corpus/`storeName`) recording what the Vertex AI corpus is actually running on: `deploymentMode` (`SPANNER` | `SERVERLESS`), `embeddingModel`, `corpusId`. The app reads this instead of assuming a deployment mode.

---

## Personal library (`library-schema.ts`)

### `libChunks` (`wolfmed_lib_chunks`)
Chunks of a student's own notes and uploaded materials — see the "Personal library" tier in the root `CLAUDE.md` data-source table. Isolation is structural: `userId` is a `NOT NULL` FK to `users` (cascade delete), so no query can reach another student's rows without dropping the scope clause.

Key columns: `sourceType`/`sourceId` (what it was chunked from), `title`, `position` (order within the source), `content`, `contentHash` (lets a re-save skip re-embedding an unchanged chunk), `embedding: vector(EMBED_DIM)` — **nullable on purpose**: rows are written synchronously with the source, vectors filled afterward, so an unembedded chunk is invisible to vector search but immediately findable via the trigram index.

Indexes: scope-first (`userId, sourceType`), source+position (replace/attachment resolution), unique `(sourceId, position)`, GIN trigram on `content`, HNSW cosine on `embedding`, and a partial index on `userId WHERE embedding IS NULL` (drives the embedding sweep — see `constants/rag.ts` / cron `library-index`).

---

## AI tutor memory layer (`memory-schema.ts`)

Six tables under `MEM_TABLES` (`src/server/memory/config.ts`), all `wolfmed_mem_*`. This is the "Student memory — never content" tier from the CLAUDE.md data-source rules: describes the *student*, never used as subject-matter evidence.

| Table | Purpose |
|---|---|
| `memPolicies` | Pedagogical/product rules, exact-match lookup only. `(tenantId, policyKey, version)` unique; `policyType` constrained to `pedagogy \| guardrail \| blueprint \| product`. |
| `memPreferences` | Loaded in full every tutor turn — feeds the cacheable static prompt prefix. Composite PK `(userId, prefKey)`. `source` constrained to `user_stated \| llm_inferred \| admin_set`. |
| `memFacts` | The compounding layer — durable facts about a student (`subject`/`predicate`/`content`). Deduplicated via `(contentHash, userId)` unique index. `status: provisional \| active \| revoked`. Has both trigram and HNSW vector indexes for retrieval, and a self-referential `supersededBy` FK for fact revision chains. |
| `memEpisodes` | "ostatnio przerabialiśmy…" — session summaries (`taskType: tutor_session \| quiz \| mindmap_review`, `summary`, `outcome`, `keySteps`, `artifacts`). Vector + trigram indexed. |
| `memTraces` | Per-turn flight recorder (`runId`, `turnIndex`, `eventType`, `payload`, `tokenCost`, `latencyMs`) — 90-day retention, cleaned by the `memory-retention` cron. `eventType` constrained to `user_msg \| rag_retrieval \| memory_retrieval \| model_msg \| promotion`. |
| `memDeletionEvents` | Append-only GDPR audit log — every memory deletion is recorded with `scope` and `reason`, never physically reconciled away. |

All vector columns use `EMBED_DIM` from `@/constants/embeddings` — the same embedding dimensionality as the personal library, so both layers stay compatible with one embedding model config.

---

## Cross-cutting patterns

- **Cascade ownership**: nearly every user-owned table FKs `userId → users.userId` with `onDelete: "cascade"` — deleting a user cleans up their tests, notes, materials, forum posts, diagnozy progress, planner data, etc. automatically at the DB level.
- **jsonb over join tables**: content-heavy, non-relational data (test questions, procedure bodies, diagnozy steps, Lexical note content, quiz JSON) is stored as `jsonb` rather than normalized — these are read/written as whole documents, not queried by sub-field.
- **Type exports**: newer tables (from `learningPlans` onward) export `$inferSelect`/`$inferInsert` types directly beside the table definition (e.g. `LearningPlanRow`, `NewLecture`) — read/write shapes for actions and queries to import instead of re-declaring.

See [`21-server-actions.md`](./21-server-actions.md) for what writes to these tables and [`23-types.md`](./23-types.md) for domain types built on top of them.
