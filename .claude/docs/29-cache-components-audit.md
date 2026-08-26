# Cache Components Audit

[← Back to index](./README.md)

Status: audit only. No new cache work should start without updating this document.

Runtime: Next.js 16.3.2, `cacheComponents: true`.

## Operating model

The unit of rollout is a route. The unit of caching is a query or a small cached Server Component.

For each route:

1. Trace the page shell, Suspense children, layouts, helpers and Server Actions it reaches.
2. List every database getter reached by that tree.
3. Search every getter across the repository before changing it.
4. Classify each getter as shared public, user-scoped, access-critical, volatile, external, or mutation.
5. Add `use cache: remote` only to shared public getters in `src/server/queries.ts`.
6. Keep auth, access, billing, quotas, sessions and user content request-time.
7. Check every mutation, webhook and script that can change a cached getter.
8. Test cold and warm database counters locally and in Vercel Preview.
9. Set the route to `export const instant = true` only after its request-time work is correctly suspended.

`<Suspense>` streams request-time work; it does not cache. React `cache()` remains appropriate for request-scoped auth and private reads. An adopted public getter uses `use cache: remote` and does not also use React `cache()`.

## Current route state

`instant = false` is an adoption opt-out, not a data-cache policy. The following routes/layouts remain opted out and require the audits below. `/panel/nauka/[category]`, `/panel/procedury/[course]`, `/(terms)/*`, and the static `/kierunki` route are adopted and intentionally excluded from the remaining-work list.

### Global and public routes

| Route/segment | Call tree | Data class | Adoption notes |
|---|---|---|---|
| `src/app/layout.tsx` | Clerk provider → client Navbar/providers | Runtime shell only | Keep blocked until root client/runtime behavior is reviewed. Do not cache the layout. |
| `src/app/page.tsx` | Hero → static sections → `Testimonials` → `getTestimonialsWithUsernames()`; Contact form action | Static + shared testimonials | Cache testimonial getter separately; keep Contact mutation dynamic. |
| `src/app/(terms)/layout.tsx` | Footer | Static | Adopted: `instant = true`; no query. |
| `/(terms)/polityka-prywatnosci` | TermsHeader → Policy | Static | Adopted: `instant = true`; no query. |
| `/(terms)/warunki` | TermsHeader → Terms | Static | Adopted: `instant = true`; no query. |
| `/kierunki/layout.tsx` | Footer | Static | Adopted: `instant = true`; no query. |
| `/kierunki` | Static course-path content | Static | Adopted: `instant = true`; no query. |
| `/kierunki/[slug]` | params/constants → `getUserEnrollmentsAction()` → pricing/access UI | User access + static content | Keep enrollment access request-time. Public course constants do not need DB cache. |
| `/blog/layout.tsx` | `requireUser()` | Auth | Keep request-time. |
| `/blog` | `getAllBlogPosts(published)` → `AllPosts` | Shared editorial | Cache published list; tag `blog:posts`. |
| `/blog/[slug]` | `getBlogPostBySlug(slug)` → `BlogPost`; metadata calls same getter | Shared editorial + client like state | Cache post by slug; like state/action remains user-specific. |
| `/forum/layout.tsx` | `requireUser()` | Auth | Keep request-time. |
| `/forum` | `getAllForumPosts()`; Suspense `getForumNotifications(userId)` | Shared but volatile + user notifications | Start dynamic. If later cached, use short profile and exact mutation tags. |
| `/forum/[postId]` | `getForumPostById(postId)`; `getForumNotifications(userId)`; comment actions | Shared but volatile + user notifications | Start dynamic. Do not use long editorial cache. |
| `/sign-in/[[...sign-in]]` | Clerk SignIn | Auth runtime | Keep blocked. |
| `/sign-up/[[...sign-up]]` | Clerk SignUp | Auth runtime | Keep blocked. |
| `/success` | search params + auth → verified Stripe result/fulfillment | External/payment/mutation | Keep request-time. |
| `/canceled` | search params + auth → order cancellation | External/payment/mutation | Keep request-time. |

### Panel layout and core routes

Every `/panel` route also runs `panel/layout.tsx`: `requireUser()` → `getUserEnrolledCourses(userId)` → redirect if none → `getAllUserNotes(userId)` → pinned-note sidebar. These are user/access reads and must remain fresh until a separate user-cache decision.

| Route/segment | Call tree | Data class | Adoption notes |
|---|---|---|---|
| `panel/layout.tsx` | auth → enrollment join → all user notes → sidebar/modals | User/access | Never cache as one page. Split or suspend private blocks later. |
| `/panel` | DynamicBoard; `Username`; `UserMotto`; `UserAnalytics`; `BadgeWidget`; admin blog widget; storage; billing; forms | Mostly user/volatile | Do not cache whole page. `getCurrentUser()` is already request-deduped; analytics is the expensive future user-cache candidate. |
| `/panel/testy` | `getCurrentUser()` → `getAccessibleCategories()` → access checks; `checkPremiumAccessAction()` → optional `getUserCustomCategories(userId)` | Shared catalog + user access/custom data | First category-page audit. Cache only the shared catalog query; keep access/custom branches dynamic. |
| `/panel/testy/[value]` | params → auth → custom tests or `getTestsByCategory()` → `getTestSessionDetails()` → deterministic session questions | Public question bank + active user session | Question bank can be shared; session ownership/expiry and selected ordering stay dynamic. |
| `/panel/testy-egzaminy` | auth → `getAccessibleCategories()` → practical-exam catalog/list → sort/format | Shared catalogs + access | Reuses category catalog; practical-exam source must be audited separately. |
| `/panel/egzaminy` | auth/enrollment gate → public practical exams → premium access | Shared exam catalog + access | Cache public exam catalog only. |
| `/panel/egzaminy/[slug]` | auth/enrollment → public exam by id or owned generated exam | Mixed public/user | Cache static public exam lookup; never cache owned generated exam without a separate user decision. |
| `/panel/wyniki` | current user → `getCompletedTestsByUser(userId)` | User history | Keep request-time initially. |
| `/panel/wyniki/[testId]/layout.tsx` | Flex wrapper | None | No query. |
| `/panel/wyniki/[testId]` | `getCompletedTest(testId)` → result card | User history | Verify ownership at the query/page boundary before any cache decision. Keep fresh. |
| `/panel/plan` | user → `getPlanProgress(userId)`; enrolled courses; `getConceptCatalog(course)`; `getProcedureOptions(course)` | User progress + shared planner catalogs | Cache catalog/options separately; keep progress and enrollment dynamic. |
| `/panel/ustawienia` | auth/preferences/memory actions; settings sections | User settings | Keep request-time. |
| `/panel/dodaj-test` | current user → premium/access → accessible categories; upload/custom-test forms | Shared catalog + user/custom writes | Cache only shared category catalog; forms and custom data stay dynamic. |

### Panel learning routes

| Route/segment | Call tree | Data class | Adoption notes |
|---|---|---|---|
| `/panel/nauka` | current user → category section; cells; lectures; notes; flashcards; materials | Shared category catalog + user library | Cache shared category catalog. Keep all personal sections dynamic. |
| `/panel/nauka/[category]` | auth/custom category branch or cached public `getTestsByCategory(category)` → `AllTests` | Public question bank + user custom tests | Adopted pilot. Public getter is remote-cached; custom branch is not. |
| `/panel/nauka/notatki/[noteId]` | auth → `getNoteById(userId,noteId)`; note decks/flashcards | User content | Keep request-time. |
| `/panel/procedury` | current user → enrolled courses → `getProceduresCount(course)` | Shared counts + access | Cache public count per course; keep enrollment dynamic. |
| `/panel/procedury/[course]` | params → auth/enrollment → cached `getAllProcedures(course)` → browser | Public procedure catalog + access | Adopted pilot. |
| `/panel/procedury/[course]/[slug]` | `getProcedureBySlug(course,slug)` + auth/access/status UI | Shared procedure + user access/progress | Cache procedure definition by course/slug; keep progress/access dynamic. |
| `/panel/procedury/[course]/[slug]/wyzwania` | procedure → auth → challenge progress action | Shared procedure + user progress | Cache procedure definition only. |
| `/panel/procedury/[course]/[slug]/wyzwania/[type]` | procedure → auth/course access → latest generated quiz/progress | Mixed public/user/generated | Cache static procedure only; generated quiz/progress stays dynamic. |
| `/panel/diagnozy` | current user → `getAllDiagnozy()` + user completions | Shared diagnosis catalog + user completion | Cache diagnosis catalog; keep completions dynamic. |
| `/panel/diagnozy/[slug]` | params → `getDiagnozaBySlug()` + formulations → auth/completions | Shared diagnosis + user progress | Cache diagnosis definition/formulation; keep completion state dynamic. |
| `/panel/diagnozy/egzamin` | auth → user attempts → diagnosis titles | User attempts + shared titles | Cache title lookup; keep attempts dynamic. |
| `/panel/kursy` | current user → enrolled courses | User/access | Keep request-time. |
| `/panel/kursy/[categoryId]` | params → auth/course access → `countTestsByCategory(category)` | Shared count + access | Cache count per category; keep access dynamic. |

### Admin routes

Admin layout uses `requireAdmin()` and `AdminNavBadged` (message stats + forum notifications). Admin auth and unread/notification state stay request-time.

| Route/segment | Call tree | Data class | Adoption notes |
|---|---|---|---|
| `/admin` | blog statistics/posts + message stats + forum stats/recent posts | Mixed editorial/admin/volatile | Cache published editorial pieces only; keep admin stats and drafts fresh. |
| `/admin/categories` | blog categories + tags | Editorial admin | Cache only if public category/tag consumers share the same read getter; drafts/admin management may stay fresh. |
| `/admin/categories/new` | categories + tags → create form | Editorial admin + mutation | Keep form/mutation dynamic; catalog reads can use shared cache after consumer audit. |
| `/admin/categories/[id]/edit` | category by id → edit form | Editorial admin + mutation | Keep draft/edit data fresh. |
| `/admin/posts` | blog post list including admin statuses | Editorial admin | Do not reuse public published-list cache for drafts. |
| `/admin/posts/new` | categories + tags → create form | Editorial admin + mutation | Keep dynamic. |
| `/admin/posts/[id]/edit` | post by id + categories + tags → edit form | Editorial admin + mutation | Keep dynamic unless a separate admin-cache decision is made. |
| `/admin/tags/new` | create tag form | Mutation | Keep dynamic. |
| `/admin/tags/[id]/edit` | tag by id → edit form | Mutation | Keep dynamic. |
| `/admin/forum` | forum posts/pagination + stats + notifications | Volatile/admin | Keep dynamic initially. |
| `/admin/messages` | paginated messages + count/stats | Volatile/admin | Keep dynamic. |
| `/admin/rag` | File Search store status/documents/actions | External/admin | Keep request-time. |

## Shared getter consumer map

| Getter/domain | Known consumers | Policy |
|---|---|---|
| Tests category catalog/counts | `/panel/testy`, `/panel/nauka`, `/panel/testy-egzaminy`, `CreateTestTabs`, AI/manual-test validation, planner catalog, `/panel/kursy/[categoryId]` | Introduce one grouped public catalog query in `queries.ts`; leave standalone count getter until its consumers are adopted. |
| Tests by category | `/panel/nauka/[category]`, test-session question selection | Remote-cache public bank by category; custom/session state remains dynamic. |
| Procedures list/count | `/panel/procedury`, `/panel/procedury/[course]`, planner options | Remote-cache public definitions/counts by course. |
| Procedure by slug/id | detail/challenge routes | Remote-cache definition by stable course/slug/id; progress/access remains dynamic. |
| Blog published content | `/blog`, `/blog/[slug]`, public widgets/related content | Cache published-only getters with editorial tags. Do not mix drafts/admin reads. |
| Diagnosis definitions | diagnosis list/detail/exam title/formulation readers | Cache definitions/titles; keep completions/attempts dynamic. |
| Practical exam catalog | test/exam hubs | Audit source functions first; cache only static/public exam definitions. |
| Planner catalog | `/panel/plan`, wizard/components | Cache concept catalog and procedure options; progress remains user-scoped. |
| Testimonials | home page | Cache visible public testimonials only after mutation tags are mapped. |
| Forum | forum/admin/user notification readers | Volatile; keep dynamic initially. |
| User/auth/enrollment | almost every panel route and access action | React request cache only; no shared remote cache initially. |

## Mutation and invalidation map

| Data | Writers | Required invalidation when cached |
|---|---|---|
| Public tests | seed/import/replace scripts; no normal app writer found | Daily TTL currently; add deployment/script revalidation if immediate freshness is required. |
| Procedures | seed/import scripts; no normal app writer found | Daily TTL currently; add script/deployment revalidation if needed. |
| Blog posts/categories/tags | `src/actions/blog.ts`, `blogCategories.ts` | `updateTag()` for Server Actions; `revalidateTag(tag,'max')` for webhook/route-handler paths, plus route refresh where needed. |
| Testimonials | testimonial actions | Invalidate visible testimonial tags after create/update/delete. |
| Diagnosis catalog | seed/import paths | TTL or explicit revalidation after seed. |
| Courses/catalog | admin/course actions and payment workflows | Cache only public course metadata; enrollment/access stays fresh. |
| Enrollments/access | Stripe webhooks, subscription actions | Do not remote-cache initially; access revocation must be immediate. |
| User dashboard/content | notes, materials, tests, plans, challenges, profile actions | User-scoped cache requires a separate policy, tags and deletion/read-your-own-write audit. |

## Route adoption order

1. `/panel/testy`: shared category catalog query, then `instant = true`.
2. `/panel/procedury/[course]`: public procedure definitions — pilot already proven.
3. `/panel/procedury`: public counts, access stays dynamic.
4. `/panel/nauka`: shared category catalog plus personal sections kept dynamic.
5. `/panel/testy-egzaminy`, `/panel/dodaj-test`, `/panel/kursy/[categoryId]`: reuse audited catalog/count getters.
6. Diagnosis catalog routes: definitions first, completion state later.
7. Blog published routes: list/detail editorial cache with mutation tags.
8. Practical exam catalog and planner public catalogs.
9. Forum/testimonial/admin shared data only after freshness and mutation policy is explicit.
10. `/panel` user dashboard last; never cache the whole page. Consider a separately approved user-scoped analytics snapshot.

## Verification contract for every route

Before:

- Record `pg_stat_user_tables` counters for the relevant table, or use `pg_stat_statements` when available.
- Directly open the route; avoid unrelated landing pages during the counter window.
- Record cold counters, then five hard refreshes.

After:

- Cold request should execute each newly cached public key once.
- Warm refreshes should not increase relevant table counters.
- Test a second key (category/course/slug).
- Test a consumer route that shares the getter.
- Test mutations or document the TTL-only limitation.
- Run local `next start`, then Vercel Preview.
- Run build, lint and tests before commit.

## Current known constraints

- `pg_stat_statements` is unavailable on the current Neon branch; table-level counters are the fallback.
- Local `use cache: remote` uses Next's in-memory default handler. Vercel Preview is required to verify distributed remote behavior.
- Existing `instant = false` opt-outs include layouts; setting a leaf page to `instant = true` does not make private parent layouts cacheable.
- `getCategories()` currently transfers all test metadata and `countTestsByCategory()` creates the observed N+1 pattern. The grouped catalog query is a separate measured optimization, not something to silently combine with the first cache measurement.
