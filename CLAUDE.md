# CLAUDE.md

This file provides essential context for Claude Code (claude.ai/code) when working within the Wolfmed repository.  
It serves as the main entry point for understanding project structure and references to detailed technical documentation.

---

## 🩺 Project Overview

**Wolfmed** is a modern **medical education platform** built with **Next.js 16**, designed for interactive test-taking, procedural learning, and collaborative study.  

### Core Features
- **Test-Taking System** – Configurable medical tests with real-time feedback
- **Procedural Learning** – Step-by-step algorithmic training and visual recognition
- **Community Forum** – User discussion threads with moderation tools
- **Study Materials** – Rich text notes and file uploads with quotas
- **Payment System** – Stripe integration for subscriptions and supporter payments
- **Personalized Dashboards** – User-defined widgets for a tailored experience

---

## 🧰 Technology Stack

| Category | Tool |
|-----------|------|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Database | PostgreSQL (Neon) + Drizzle ORM |
| Authentication | Clerk |
| Payments | Stripe |
| UI | TailwindCSS v4, Framer Motion |
| State | Zustand |
| Rich Text | Lexical Editor |
| File Uploads | UploadThing |
| Package Manager | pnpm |

---

## 🗂️ Repository Structure

```
src/
├── app/            # Next.js App Router routes
├── server/         # Database + server-side logic
├── actions/        # Server Actions (validated with Zod)
├── components/     # Shared UI components
├── styles/         # Tailwind globals
├── hooks/          # Custom React hooks
├── types/          # TypeScript type definitions
└── lib/            # Utilities and configs
```

---

## 📏 Code Organization Rules

**These rules apply to all new and modified code:**

1. **One component per file** — never define multiple React components in a single file.
2. **Max ~90–100 lines per file** — when a file approaches this limit, extract subcomponents, hooks, or logic into new files instead of growing it.
3. **Helper functions** — before writing any helper, check `/src/helpers` for an existing one. If none exists, create it there following the helpers convention: **one file per function**.
4. **Types** — always place types in a dedicated file in `/src/types` for the given domain (e.g. `mindmapTypes.ts`), never inline in large component files.

---

## 🥇 Golden Rules

**Non-negotiable. These override any pattern found in existing code — where old code disagrees, the old code is wrong.**

### 1. Comments — zero by default

The only acceptable comment explains **why** on genuinely non-obvious logic (see the `decodeURIComponent` note in `panel/nauka/[category]/page.tsx` — it exists because category names contain Polish characters). Never write section banners, restatements of the code, or JSDoc on self-evident functions. If a comment is needed to explain *what* code does, rename the thing instead.

### 2. `page.tsx` is a shell, not a screen

Reference: `src/app/panel/testy/page.tsx`.

- A page contains only: `metadata` / `generateMetadata`, `export const dynamic`, and a default export returning a layout wrapper plus `<Suspense>` boundaries.
- Each async data fetch lives in its own `async function` (or its own file) behind its own `<Suspense fallback={<XSkeleton />}>`, so the shell paints immediately instead of the route blocking on the slowest query.
- Fallbacks are real skeletons from `@/components/skeletons` — never `<div>Loading...</div>`, and `fallback={null}` only when the subtree renders nothing visible.
- No markup beyond the layout wrapper. Headers, empty states, cards, and CTAs are their own component files.

### 3. Nothing lives in a page that isn't the page

No helper functions, constant maps, or data-shaping loops inside `page.tsx`. Helpers → `/src/helpers` (one file per function; search first). Constants → `/src/constants`. Types → `/src/types/<domain>Types.ts`.

### 4. Server/client boundary

Auth, data fetching, and redirects run on the server; interactivity lives in a `'use client'` island receiving data as props. A page is never a client component.

### 5. Caching, filtering, and sorting go through react-query

Reference: `src/components/AllTests.tsx`.

Client-side search, filter, and sort use `useQuery` with a stable `queryKey` that includes the discriminator (category, slug, session), `initialData` seeded from server props, and a shared `staleTime`. Search inputs debounce via `useDebouncedValue`. Never hand-roll `useState` + `useEffect` + `.filter()`.

### 6. Forms

As specified in **Forms & Validation** below — server-only Zod, `useActionState`, `FieldError` per field, `useToastMessage`. No client-side validation, ever.

### 7. Extract, don't compress

At ~90–100 lines a file gets split into new files. Never shrink a file by collapsing whitespace, merging responsibilities, or golfing the code.

### 8. Use the shared UI components

Never hand-roll a raw `<input>`, `<select>`, `<textarea>`, or `<label>` with ad-hoc Tailwind classes. Use the components in `/src/components/ui` (`Input`, `Label`, `Select`, `Textarea`, …). Check that directory before writing any form control or primitive.

If no existing component fits, **add one to `/src/components/ui`** rather than styling an element inline — a local `const selectClass = '…'` string inside a component is the signal that a shared component is missing. Keep them generic: props for value/options/handlers, no hardcoded `name`/`id`, no binding to a specific store or domain type. A component that only serves one caller belongs next to that caller, not in `/ui`.

The same applies to visual primitives beyond form controls (buttons, cards, badges) — one styled implementation, reused, not copied class strings.

---

## 🎯 Component Architecture Patterns

### Modal Components

**Critical Rule**: Render modals at page/layout level, NOT in nested components.

**Problem**: `/panel/layout.tsx` has `position: relative` - breaks `position: fixed` modals rendered inside nested components.

**Solution Pattern**:
1. Lift modal state to page level
2. Pass `onOpenModal` callback down through components
3. Render modal component at page level, outside nested structure

**Example**:
```tsx
// ❌ WRONG - Modal in nested component (breaks with position: relative parent)
export default function Toolbar() {
  const [showModal, setShowModal] = useState(false)
  return (
    <>
      <button onClick={() => setShowModal(true)}>Edit</button>
      {showModal && <EditModal />}  {/* Broken positioning */}
    </>
  )
}

// ✅ CORRECT - Modal at page level
export default function Page() {
  const [showModal, setShowModal] = useState(false)
  return (
    <>
      <Toolbar onEditClick={() => setShowModal(true)} />
      {showModal && <EditModal />}  {/* Works correctly */}
    </>
  )
}
```

**Global Modals**: Use Zustand store for app-wide modals (confirmations, alerts). See `useConfirmModalStore` + `ConfirmModal` component.

**Alternative**: React portals (`createPortal`) can bypass positioning issues but add complexity.

---

## 📝 Forms & Validation

**Critical Rule**: Validation is **server-only, with Zod, inside the Server Action**. Do NOT add client-side validation — no client Zod `safeParse`, no manual field checks in the component, no `noValidate`, and do not reach for native HTML constraint attributes (`required`, `minLength`, `pattern`, …) as a validation layer. The Server Action's Zod schema is the single source of truth.

**The canonical form pattern** (see `MottoForm.tsx` for the reference implementation):
1. `const [state, action] = useActionState(serverAction, EMPTY_FORM_STATE)`
2. `<form action={action}>` — wire the action directly; never wrap it in a client validator.
3. Inputs use the custom UI components: `Input`, `Textarea`, `Label`, `Select` (`/src/components/ui`).
4. `<FieldError name="..." formState={state} />` after **every** field — it is the per-field Zod-message container; keep one for each input.
5. `const noScriptFallback = useToastMessage(state)` surfaces `state.message` as a toast; render `{noScriptFallback}` inside the form.
6. The Server Action validates with a Zod schema from `/src/server/schema.ts` and returns errors via `toFormState` / `fromErrorToFormState`.

**Returning validation errors (do this exactly):**
- On a Zod failure, return `fromErrorToFormState(error)` — it produces `{ status: 'ERROR', message: '', fieldErrors, timestamp }`. The **empty `message` is intentional**: `FieldError` renders `state.message` on *every* field, so a non-empty top-level message would repeat under each input.
- **Never** pair a generic top-level message with `fieldErrors` (e.g. ``toFormState('ERROR', 'Popraw błędy w formularzu.')`` + `fieldErrors`). That is the exact anti-pattern that repeats the same text on every field.
- For a single server-side business error tied to one field (e.g. "subject not accessible"), return `{ ...toFormState('ERROR', ''), fieldErrors: { fieldName: ['message'] } }`.
- Reserve a non-empty top-level `message` for form-wide, non-field errors (rate limit, auth, unexpected failure) — surfaced via the toast.
- Give a Zod field a custom message for the empty/`null` case with `z.string({ error: '…' })` (an unpicked `<select>` submits `null`, which fails the type check before `.min()` runs).

**Why** — a single server-side Zod schema keeps validation authoritative and avoids drift between two rule sets. Errors already round-trip cleanly through `FormState` → `FieldError` + `useToastMessage`, so the server round-trip *is* the UX.

---

## ❤️ Blog Likes

Authenticated users can like/unlike blog posts. The whole `/blog` segment is
auth-gated in `src/app/blog/layout.tsx` via `requireUser()`, so every viewer is
signed in — there is no signed-out UI path.

**Data flow**
- **Table**: `blogLikes` (`blog_likes`) — composite `(userId, postId)`, cascade delete on post (`server/db/schema.ts`).
- **Action**: `toggleBlogLikeAction` (`actions/blog.ts`) — auth + rate-limit (`blog:like`) + Zod (`LikeBlogPostSchema`); inserts if absent / deletes if present (server-side toggle is idempotent against stale clicks); returns the new `{ liked, count }` in `FormState.values`.
- **Read helper**: `getBlogLikeState(postId) → { liked, count }` — used by the client button to hydrate per-user state.
- **Counts**: `getBlogPostBySlug` returns `_count.likes`; `getAllBlogPosts` adds counts via a grouped `blogLikes` query for the list cards.

**Why a client island** — the blog routes render dynamically (the layout's
`requireUser()` reads request auth), but the page itself stays user-agnostic so
its payload is cacheable per post, not per user. Per-user like state lives in
the `BlogLikeButton` client component (`useActionState` + `<form>` +
`useToastMessage`, the standard form pattern), which hydrates on mount via
`getBlogLikeState`. The list card (`BlogPostCard`) shows a read-only heart +
count only.

---

## 🧠 Data Sources — what the LLM may see

Every AI feature (tutor, mind map, tests, flashcards, plans, lectures, `/commands`)
draws on the same four tiers. Three carry content; the fourth never does. Place a
new feature's inputs in these terms before writing code.

**1. Curriculum — the corpus.** Global, identical for every student, searchable by
every feature through one entry point: `retrieveCorpusContext`
(`server/vertex-rag/context.ts`). Knobs live in `constants/rag.ts` — never inline a
topK or threshold.

> **The search query is the subject and nothing else.** Memory, attachments,
> formatting instructions and prose wrappers dilute the query embedding, and a term
> that *is* in the corpus comes back as "no information". When a feature's question
> is prose composed for the student to read, it sends a separate `searchTopic`
> carrying the subject alone.

**2. Personal library.** The student's notes and uploaded materials. Scoped to one
user, never visible to another.

**3. Attachments — `@resource`.** An explicit pick of one note or material by exact
display name — "summarise *this* note" is a different intent from "search
everything". An attachment is the PRIMARY source; corpus chunks stay secondary.
Nothing in the request path reads from disk.

**4. Student memory — never content.** Memory describes the *student*, not the
subject, and is not evidence. Preferences and policies (`memoryPrefix`) shape tone
and depth for the conversational tutor only. Facts and episodes (`memoryTail`)
belong solely to questions about the student themselves, which `isSelfStateQuestion`
routes to a memory-only path; they never enter a subject answer and never reach a
retrieval query.

| Feature | Corpus | Personal | Attachments | Memory |
|---|---|---|---|---|
| Conversational tutor | yes | yes | yes | preferences only |
| Self-state questions | no | no | no | yes — memory only |
| Mind map · AI tests · `/commands` · lectures | yes | yes | yes | **no** |

**No source, no output.** A generator with nothing to ground on says so. It never
falls back to the model's own knowledge and presents the result as if it came from
the documents — a plan invented from pretraining is indistinguishable, to the
student, from one built on the curriculum. Commands producing study material carry
`requiresSource` in `constants/toolCommands.ts` and stop with a message naming what
was missing.

---

## 🔒 Retrieval rules

**Non-negotiable. Every one of these was written after the opposite behaviour
shipped and had to be measured out again.**

1. **`retrieveContext` is the only way to read context.** One entry point,
   `server/retrieval/context.ts`. A feature declares a `RetrievalMode` at the call
   site. Never call `retrieveContexts` or `retrieveLibrary` directly from a
   feature — a second retrieval path is how the tier table above stops being true.

2. **The query is the subject alone.** Prose wrappers dilute it. `word_similarity`
   scores the whole query against a chunk's best extent, so two filler words took
   a chunk that *contained the answer* from 1.000 to 0.467 and buried it. The
   library query goes through `stripQueryFiller`; features that compose prose for
   the student to read send a separate `searchTopic`.

3. **Scores from different tiers are never comparable.** Corpus is a Vertex vector
   **distance** (lower is better); library is a similarity (higher is better), from
   a different model. Combine by **rank** — `reciprocalRankFusion` — never by score.
   Never build a UI or a threshold that puts them in one column.

4. **A tier that missed contributes nothing.** `isCorpusMiss` and
   `dropMissedSources` drop a whole source rather than let its least-bad chunks
   occupy slots. Both judge the **best** chunk: per query for the corpus, **per
   document** for the library — a tier-wide gate lets one relevant note admit every
   unrelated file behind it. `hasCanonical` follows from the corpus being empty, and
   the prompt says so when it is false.

5. **Chunk labels are internal.** Origin labels weight sources for the model; they
   are not citations. Answers carry no `[1]`, no `(BAZA WIEDZY)`, no
   `(TWOJA NOTATKA — plik.md)` — the student reads the sources panel.
   `stripContextCitations` is the backstop, the prompt is the fix. Chunks go in
   **unnumbered**: a numbered list is an invitation to cite a number.

6. **Answer the question, not the retrieved topic.** Retrieval returns adjacent
   material by design. Fragments are candidates, not an agenda.

7. **Contradictions are named on both sides, and only when relevant.** Curriculum
   wins the fact; the answer states what the student's note claimed and what the
   curriculum says. "W notatce jest inaczej" alone is a failure — so is dragging an
   unrelated note's error into an answer that never asked about it.

8. **Thresholds are measured, not chosen.** `LIB_TRGM_FLOOR`,
   `CORPUS_MISS_DISTANCE`, `PERSONAL_MISS_SCORE` each carry the distribution they
   came from in a comment. Change one only against real data, and update the
   comment with it.

**Cost boundary.** Storage and notes ship with the course, so every plan writes
notes and uploads to its 20 MB. Premium buys the **model calls** — PDF extraction
and embedding. A basic plan writes **no `lib_chunks` rows at all**, which is what
keeps `embedding IS NULL` meaning "queued" and nothing else. Basic uploads are
marked `not_indexed` at insert, or the cron backstop extracts them anyway.

---

## 🚀 Development Commands

```bash
pnpm run dev       # Start local development
pnpm run build     # Build for production
pnpm run start     # Run production server
pnpm run lint      # Run ESLint
```

### Database Operations
```bash
pnpm run db:push   # Push schema changes to the database
pnpm run db:studio # Open Drizzle Studio
```

---

## 📚 Reference Documentation

For detailed implementation patterns, refer to the following markdown files in the repository root:

| Topic | File |
|--------|------|
| **Database Schema** | [schema.md](./.claude/schema.md) |
| **Database Queries** | [queries.md](./.claude/queries.md) |
| **Server Actions & Validation** | [server-actions.md](./.claude/server-actions.md) |
| **Styling & Tailwind Configuration** | [tailwind-styles.md](./.claude/tailwind-styles.md) |
| **System Flows (tutor · tools · memory · retrieval · planner)** | [flows.md](./.claude/flows.md) |

Each of these files contains specific conventions, examples, and best practices for their respective areas.  
Claude should defer to these files for deeper technical references.

---

## ✅ Agent Instructions

Claude (or any coding assistant) should follow these principles when interacting with this repository:

1. **Use this `CLAUDE.md`** for high-level project context.
2. **Reference linked markdown files** for detailed instructions (e.g., queries, schema, or styling).
3. **Avoid duplication** — rely on existing implementations in `/server`, `/actions`, or `/lib`.
4. **Follow Zod validation and server-first architecture** as described in `server-actions.md`.
5. **Use TailwindCSS v4 conventions** defined in `tailwind-styles.md`.
6. **Keep code clean and self-documenting** — Only add comments to code that is genuinely complex or difficult to understand. Prefer clear naming and simple logic over excessive commenting. Comments should explain "why", not "what".
7. **Check before creating** — Before adding any new function, query, or utility, search the codebase to verify it doesn't already exist. Use grep/search to check `/server/queries.ts`, `/actions`, and `/lib` for similar functionality.  
8. **Never run scripts without asking** — Do NOT execute anything in `/scripts`, any `pnpm run` task that mutates data, or any command that writes to `/data`, the database, or an external service. Write the script, show the exact command, and wait for the user to run it or explicitly approve. This holds even when the script was written for the task at hand and even when the change looks obviously correct — the user decides when data changes. Read-only inspection (`grep`, `git status`, `git diff`, `tsc --noEmit`, `pnpm run lint`) does not need approval.

---

## 🧩 Summary

This simplified structure ensures:
- Faster project context loading for AI agents and developers  
- Clear separation between project overview and technical deep-dives  
- Reduced noise while maintaining full documentation coverage

---

© 2025 Wolfmed. All rights reserved.
