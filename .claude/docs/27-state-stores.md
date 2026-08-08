# State Stores (Zustand)

[← Back to index](./README.md)

All 27 files in `src/store/`, one Zustand store per file. Per [`00-architecture.md`](./00-architecture.md), these hold **ephemeral UI state**, not server/cached data (that's React Query's job, per Golden Rule #5). Reminder: `src/store/useStore.ts` is a real Zustand store instance, distinct from the generic hydration-safe selector wrapper at `src/hooks/useStore.ts` — see [`22-hooks.md`](./22-hooks.md) for that disambiguation.

## Global UI chrome

| Store | Purpose |
|---|---|
| `useStore.ts` | The app-wide store — `isMenuOpen`/`toggleMenu` for the mobile nav drawer (see `Navbar` in [`10-pages-public.md`](./10-pages-public.md)). |
| `useMobileStore.ts` | `isMobile: boolean` + `setIsMobile()`. **Correction (round 7 of doc-testing)**: an earlier pass of this doc hedged that something "likely" calls `setIsMobile` on resize. Checked directly — grepping the whole codebase for `setIsMobile` and for `useMobileStore` outside its own definition file returns **zero results**. This store is defined and exported but never imported anywhere. Apparently dead code — flagged in the README audit list. |
| `useTopPanelStore.ts` | Top-panel/header UI state within the dashboard. |
| `useDashboardStore.ts` | General `/panel` dashboard UI state. |

## Modals (rendered once at layout level per the Modal Rendering Rule)

| Store | Backing component | Purpose |
|---|---|---|
| `useConfirmModalStore.ts` | `<ConfirmModal />` | App-wide confirmation dialog (rendered in `panel/layout.tsx`) — see [`00-architecture.md`](./00-architecture.md) → Modal rendering rule. |
| `useSettingsModalStore.ts` | `<SettingsModal />` | `isOpen` boolean + `openSettingsModal()`/`closeSettingsModal()` only — no payload. |
| `useMaterialModalStore.ts` | `PdfPreviewModal` / `TextPreviewModal` / `UploadMaterialModal` | Four independent modal slots (`pdfModal`, `videoModal`, `textModal`, `uploadModal`), each `{isOpen, src/content, title?}`; opening any one closes the other three. Note: the store tracks a `videoModal` slot but there is currently no dedicated video-preview modal component consuming it — only the PDF/text/upload slots have a rendering component today. |
| `useFlashcardReviewStore.ts` | `<FlashcardReviewModalHost />` | Flashcard spaced-review session modal state. |

## Cookie consent & banners

| Store | Purpose |
|---|---|
| `useCookieConsentStore.ts` | Exports `COOKIE_CONSENT_KEY`, `COOKIE_CONSENT_DURATION_DAYS`, `defaultConsent` alongside the store — persisted cookie-category consent state backing `CookieConsentBanner`. |
| `useInstagramBannerStore.ts` | Dismiss state for the `FloatingInstagram` banner. |
| `useNoCoursesBannerStore.ts` | Dismiss/visibility state for the "you have no courses yet" banner shown to unenrolled users. |

## Tests & test-authoring

| Store | Purpose |
|---|---|
| `useGenerateTestStore.ts` | In-progress state for the timed test-taking UI (`GenerateTests`). |
| `useCustomTestsStore.ts` | UI state for the custom-test-authoring flow (`/panel/dodaj-test`). |
| `useTestFormStore.ts` | Form state for creating/editing a single test question. |
| `useTestCellStore.ts` | State for a "test" board cell (draft questions typed inline). |
| `useQuestionSelectionStore.ts` | Multi-select state (e.g. picking questions to add to a custom category). |
| `useSortCompletedTestsStore.ts` | Sort preference for the completed-tests list (`/panel/wyniki`). |
| `useProblematicQuestionsStore.ts` | UI state around the "problematic questions" analytics view. |

## Procedures & challenges

| Store | Purpose |
|---|---|
| `useProceduresStore.ts` | UI state for procedure browsing. |
| `useProcedureStepsStore.ts` | Step-navigation state within a procedure reader. |
| `useChallengeStore.ts` | In-progress challenge attempt UI state. |

## Search

| Store | Purpose |
|---|---|
| `useSearchTermStore.ts` | Generic shared search-term state. |
| `useBlogSearch.ts` | Blog list search term. |
| `useForumSearch.ts` | Forum list search term. |

## AI tutor & settings

| Store | Purpose |
|---|---|
| `useRagStore.ts` | Tutor chat UI state (open/closed drawer, current conversation reference, etc. — feeds the `MobileAIFloat` chat surface). |
| `useSettingsStore.ts` | Two **persisted** (localStorage, key `wolfmed-settings`) preference flags: `showMobileAI`, `slashCommandsEnabled`. Confirmed distinct from `useSettingsModalStore` — that one holds only the modal's `isOpen` boolean, this one holds the actual preference values. (Not the only store that persists — see the note at the bottom of this doc; an earlier version of this entry incorrectly implied it was.) |

---

## Which stores persist (localStorage), and why it matters for debugging

An earlier version of this doc implied `useSettingsStore` was the only persisted store. It isn't — **9 of the 27** use Zustand's `persist` middleware, verified by grepping every file in `src/store/` for the import: `useBlogSearch`, `useCellsStore`, `useCookieConsentStore`, `useForumSearch`, `useProblematicQuestionsStore`, `useProceduresStore`, `useQuestionSelectionStore`, `useSearchTermStore`, `useSettingsStore`. This matters for debugging a "why does this UI state survive a hard refresh / reappear after I thought I cleared it" report — check this list before assuming a store resets on reload.

Worth calling out specifically: `useSearchTermStore` uses a `partialize` function to persist `isExpanded`/`perPage`/`pageByCategory` but **deliberately excludes** the live `searchTerm` itself from persistence — the source comment explains why: "Bookmarks and display preferences outlive a session; the search term is a filter and must not, or a stale one silently empties the list on the next visit." A useful pattern to know about (partial persistence, not all-or-nothing) if another store ever needs the same treatment.

Confirmed clean otherwise: every store here has exactly one concern, and the two that looked like they might overlap by name (`useSettingsStore`/`useSettingsModalStore`) don't.
