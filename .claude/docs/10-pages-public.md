# Public / Marketing Pages

[← Back to index](./README.md)

Routes covered: `/` (home), `/kierunki`, `/kierunki/[slug]`, `/blog`, `/blog/[slug]`, `/forum`, `/forum/[postId]`, `/(terms)/*`, `/sign-in`, `/sign-up`, `/success`, `/canceled`.

None of these routes sit under `panel/layout.tsx` or `admin/layout.tsx`; auth gating (where present) happens per-segment — see [`00-architecture.md`](./00-architecture.md) → Auth model.

---

## `/` — Home page

**File**: `src/app/page.tsx` — `export const dynamic = 'force-static'` (fully static, no per-request data).

A pure composition shell rendering, in order: `Hero` → `EducationPathsSection` → `Testimonials` → `About` → `Contact` → `Footer`, with `GradientOverlay` + `FloatingShapes` as a fixed background layer and `FloatingInstagram` as a floating CTA.

| Section | Component | Notes |
|---|---|---|
| Hero | `src/app/_components/Hero.tsx` → `HeroContent.tsx` | Static marketing copy/CTA. |
| Education paths | `src/app/_components/EducationalPaths.tsx` (`'use client'`) | Renders 3 `EducationalPathCard`s from static data `CAREGIVER`, `NURSE`, `INFO` in `@/constants/educationalPathCards`. Links into `/kierunki/[slug]`. |
| Testimonials | `src/app/_components/Testimonials.tsx` (async Server Component) | Fetches `getTestimonialsWithUsernames()` from `@/server/queries`, streams into `<Suspense fallback={<TestimonialsCarouselSkeleton />}>` wrapping `TestimonialsCarousel`. |
| About | `src/app/_components/About.tsx` | Static content. |
| Contact | `src/app/_components/Contact.tsx` → `ContactForm.tsx` (`'use client'`) | See form flow below. |
| Footer | `src/app/_components/Footer.tsx` | Static links. |

### Contact form flow
`ContactForm.tsx` is sign-in gated via Clerk's `<Show when="signed-in">` / `<Show when="signed-out">` (not a redirect — signed-out visitors see an inline "sign in to contact us" card with a `<SignInButton mode="modal">`). Signed-in form:
- `useActionState(sendEmail, EMPTY_FORM_STATE)` → `<form action={action}>`
- Fields: `email`, `message` (custom `Input`/`Label` + a plain `<textarea>`), `<FieldError>` per field, `useToastMessage(state)` for top-level errors.
- **Action**: `sendEmail` in `src/actions/actions.ts:325`. Rate-limited (3/hour via `checkRateLimit(email, "email:send")`, Upstash-backed), validated with `CreateMessageSchema`, inserts into `customersMessages` table (see [`01-database-schema.md`](./01-database-schema.md)). Read/actioned from the admin side via [`13-pages-admin.md`](./13-pages-admin.md) → Messages.

### Navbar (rendered globally from root layout)
`src/app/_components/Navbar.tsx` (`'use client'`) — reads `isMenuOpen` from the Zustand `useStore`, scroll state from `useScroll` hook, and `navLinks` from `@/constants/navLinks`. The `/panel` nav link is disabled (grayed, non-clickable) when `user.publicMetadata.ownedCourses` is empty, so users without a course purchase see the panel link but can't enter it. `<Show when="signed-in">` gates the nav links + hamburger menu (`NavDrawer`); `AuthSection` renders sign-in/user-button depending on auth state.

---

## `/kierunki` — Course/path catalog

**File**: `src/app/kierunki/page.tsx` — static, delegates entirely to `<KierunkiPageContent />` (`src/components/KieurnkiPageContent.tsx`).

**Layout**: `src/app/kierunki/layout.tsx` — no auth gate; just wraps children with `Footer`.

## `/kierunki/[slug]` — Individual course/path landing page

**File**: `src/app/kierunki/[slug]/page.tsx` — `dynamic = 'force-dynamic'` (per-request, since it needs the viewer's enrollment state). `generateStaticParams` pre-renders one param set per key in `careerPathsData` (`@/constants/careerPathsData`); `generateMetadata` builds per-course SEO tags from that same data.

Flow:
1. Fetches `getUserEnrollmentsAction()` (`src/actions/course-actions.ts`) → builds `ownedCourses` as `"${slug}-${accessTier}"` strings.
2. Looks up `careerPathsData[slug]`; `notFound()` if missing.
3. Picks a layout component by `data.templateType`: `SimplePathLayout` or `RichPathLayout` (both in `src/app/_components/`), passing `ownedCourses` plus the full `PathData` (see [`23-types.md`](./23-types.md)) through as `PathLayoutProps`.

**`RichPathLayout`** (`opiekun-medyczny`/`pielegniarstwo` style pages): if `data.questions` is set, renders `PathQuestionsHero` first (a Q&A-led hero — see below); otherwise `PathHero` (plain title/description). Then always: `CurriculumMap` (`curriculum` data, expandable subject/ECTS table, `id={CURRICULUM_ANCHOR}` from `@/constants/curriculumAnchor` — the scroll target for both heroes' "see the program" link) → `PathTools` (feature list) → `PricingSection` (`src/components/pricing/`).

**`SimplePathLayout`**: if `data.story` is set, renders `PathStoryHero` (narrative intro + `StorySceneTrack` scrollytelling) instead of the plain `PathHero`; if `data.careerPath` is also set, `PathTimeline` (the pin-and-scroll horizontal step track, via `useHorizontalPath` — see [`22-hooks.md`](./22-hooks.md)) renders below it, separated by `SectionDivider`. Falls back to `PathHero` + `PathTools` + `PricingSection` when neither `story` nor `careerPath` is present.

**Questions-hero variant** — `PathQuestionsHero` (`src/components/path/`, used by `RichPathLayout` when `questions` is set, e.g. `pielegniarstwo` via `careerQuestions.ts`): a two-column sticky hero, `PathQuestionList` (Q&A, revealed on scroll via `useSceneReveal`) on the left and `PathShotCollage` (staggered photo frames) on the right, with its own `CourseCheckoutButton` and a "see the program" link scrolling to `CURRICULUM_ANCHOR`.

### Purchase flow (Stripe)
Two entry points submit the same action: the per-tier "Buy" card in `PricingSection` (`PricingCardsGrid`), and `CourseCheckoutButton` (`src/components/path/`) rendered directly inside `PathStoryHero`/`PathQuestionsHero` for an above-the-fold buy CTA — both submit `createCheckoutSession` (`src/actions/stripe.ts`) and both are hidden once `ownsCourse(courseSlug, ownedCourses)` (`src/helpers/ownsCourse.ts`) is true:
1. Reads `priceId`, `courseSlug`, `accessTier` from `FormData`.
2. Redirects to `/sign-in?redirect_url=...` if not authenticated.
3. `getOrCreateStripeCustomer(userId)` (`src/server/stripe.ts`) to reuse/create the Stripe customer.
4. Creates a Stripe Checkout session (`mode: 'payment'`, Polish locale, tax ID collection) with `success_url=/success?session_id=...`, `cancel_url=/canceled`, and `courseSlug`/`accessTier` stashed in `metadata` for the webhook to read back.
5. `redirect(session.url)` to Stripe-hosted checkout.

The actual enrollment write happens later, asynchronously, in the Stripe webhook — see [`14-api-routes.md`](./14-api-routes.md) → `api/webhooks/stripe`, which calls `enrollUserAction(userId, courseSlug, accessTier)` (`src/actions/course-actions.ts`).

### Plan comparison panel
Below `PricingCardsGrid`, `PlanComparisonToggle` (only rendered when `PLAN_COMPARISON[courseSlug]` has entries — `@/constants/planComparison`) expands `PlanComparisonPanel`: the full feature-comparison table/cards (`PlanComparisonTable`/`PlanComparisonCards`) plus `CourseSubjectList`. Both read `usePlanComparisonStore` (see [`27-state-stores.md`](./27-state-stores.md)), wired together by a shared DOM id (`PLAN_COMPARISON_PANEL_ID`); opening it moves focus into the panel and scrolls it under the sticky navbar.

`checkCourseAccessAction` / `checkPremiumAccessAction` (same file) are the read-side helpers used throughout the app to gate premium features — DB enrollment row is the single source of truth (deliberately not Clerk `publicMetadata`, to avoid a Clerk API rate-limit hit when fanned out per-category — see the inline comment in `course-actions.ts`).

---

## `/blog` — Blog list

**Layout**: `src/app/blog/layout.tsx` — `await requireUser()`. The **entire blog segment requires sign-in**; there is no signed-out blog UI (per root `CLAUDE.md` → "❤️ Blog Likes").

**Page**: `src/app/blog/page.tsx` — fetches `getAllBlogPosts({ status: 'published', sortBy: 'publishedAt', sortOrder: 'desc' })`, renders `<AllPosts posts={posts} />` (`src/components/AllPosts.tsx`), which maps to read-only `BlogPostCard`s (title, excerpt, cover image, heart+like-count — no interactive like button on the list view).

## `/blog/[slug]` — Blog post detail

**File**: `src/app/blog/[slug]/page.tsx` — `getBlogPostBySlug(slug)`, `notFound()` if missing; `generateMetadata` builds SEO tags from `metaTitle`/`metaDescription`/`metaKeywords` (falling back to `title`/`excerpt`). Renders `<BlogPost post={post} />` (`src/app/_components/BlogPost.tsx`).

### Blog likes flow
Per-user like state hydrates client-side (the page itself stays cacheable/user-agnostic): `BlogLikeButton` (`src/app/_components/BlogLikeButton.tsx`, `'use client'`) calls `getBlogLikeState(postId)` on mount, then toggles via `toggleBlogLikeAction` (`src/actions/blog.ts`) — auth + rate-limit (`blog:like`) + `LikeBlogPostSchema` — insert-if-absent/delete-if-present against `blogLikes` (idempotent against double-clicks), returning `{ liked, count }` in `FormState.values`. See [`01-database-schema.md`](./01-database-schema.md) → `blogLikes`.

---

## `/forum` — Forum thread list

**Layout**: `src/app/forum/layout.tsx` — `await requireUser()`, whole segment sign-in gated.

**Page**: `src/app/forum/page.tsx` — `experimental_ppr = true`. Fetches `getAllForumPosts()`, renders inside `<Suspense fallback={<ForumPostsSkeleton />}>`. `CreatePostButton` (`src/components/CreatePostButton.tsx`) opens the new-post modal. A second, independently-suspended `ForumSeenMarker` server component fetches `getForumNotifications(userId)` and renders `<MarkForumSeen scope="posts" hasUnread={...}>` — a client component that clears the "new posts" unread badge once the list is actually viewed.

### Create post flow
`CreatePostButton` → modal form → `createForumPostAction` (`src/actions/actions.ts:496`).

## `/forum/[postId]` — Forum thread detail

**File**: `src/app/forum/[postId]/page.tsx` — `experimental_ppr = true`. `getForumPostById(postId)`; `notFound()` if missing. `isAuthor = userId === post.authorId` drives edit/delete affordances in `ForumDetailHeader`. Structure: `ForumDetailHeader` (title/author/edit-delete) → `ForumDetailContent` (post body) → `ForumDetailComments` (comment list + add-comment form, respects `post.readonly` — a comments-disabled flag the author sets when creating the post, not an admin action). If the viewer is the post author, a second suspended `CommentsSeenMarker` clears the "new comments" badge.

### Comment flow
`ForumDetailComments` → `createCommentAction` (`src/actions/actions.ts:610`) to add, `deleteCommentAction` (`:681`) to remove. Post-level `deletePostAction` (`:572`) lives in `ForumDetailHeader`'s author-only delete control.

---

## `/(terms)/*` — Legal pages

**Layout**: `src/app/(terms)/layout.tsx` — no auth, wraps children in `Footer` with rounded-corner styling.

- **`/polityka-prywatnosci`** (`page.tsx`, static) — `TermsHeader` + `Policy` (`src/app/_components/Policy.tsx`, static legal copy).
- **`/warunki`** (`page.tsx`, static) — same pattern, renders `Terms` (`src/app/_components/Terms.tsx`).

Both are pure content pages — no forms, no data fetching.

---

## `/sign-in`, `/sign-up`

**Files**: `src/app/sign-in/[[...sign-in]]/page.tsx`, `src/app/sign-up/[[...sign-up]]/page.tsx` — thin wrappers around Clerk's `<SignIn path="/sign-in" fallbackRedirectUrl="/" />` / `<SignUp>` catch-all components, with the same `GradientOverlay` + `FloatingShapes` background as elsewhere. All actual auth logic is delegated to Clerk; the app does not implement its own credential forms.

---

## `/success`, `/canceled` — Stripe redirect targets

- **`/success`** (static) — renders `<Success />` (`src/app/_components/Success.tsx`), the landing page after a completed Stripe Checkout (`success_url` from `createCheckoutSession`, carries `?session_id=`).
- **`/canceled`** (static) — a plain "payment canceled" card with a link back home; reached via Stripe's `cancel_url`.

Neither page queries Stripe or the DB directly — the actual enrollment write already happened (or will happen shortly after) via the `stripe` webhook, asynchronously. See [`14-api-routes.md`](./14-api-routes.md).
