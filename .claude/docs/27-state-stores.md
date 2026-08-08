# State Stores (Zustand)

[← Back to index](./README.md)

All 27 files in `src/store/`, one Zustand store per file. Per [`00-architecture.md`](./00-architecture.md), these hold **ephemeral UI state**, not server/cached data (that's React Query's job, per Golden Rule #5). Reminder: `src/store/useStore.ts` is a real Zustand store instance, distinct from the generic hydration-safe selector wrapper at `src/hooks/useStore.ts` — see [`22-hooks.md`](./22-hooks.md) for that disambiguation.

## Global UI chrome

| Store | Purpose |
|---|---|
| `useStore.ts` | The app-wide store — `isMenuOpen`/`toggleMenu` for the mobile nav drawer (see `Navbar` in [`10-pages-public.md`](./10-pages-public.md)). |
| `useMobileStore.ts` | Mobile-viewport UI state (likely the responsive breakpoint flag driving `MobileAIFloat` and similar). |
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
| `useSettingsStore.ts` | Two **persisted** (localStorage, key `wolfmed-settings`) preference flags: `showMobileAI`, `slashCommandsEnabled`. Confirmed distinct from `useSettingsModalStore` — that one holds only the modal's `isOpen` boolean, this one holds the actual preference values, and only this one survives a page reload. |

---

Confirmed clean: every store here has exactly one concern, and the two that looked like they might overlap by name (`useSettingsStore`/`useSettingsModalStore`) don't.
