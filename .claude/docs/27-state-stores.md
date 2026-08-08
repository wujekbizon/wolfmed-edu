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
| `useSettingsModalStore.ts` | `<SettingsModal />` | Settings modal open/closed + payload. |
| `useMaterialModalStore.ts` | `PdfPreviewModal` / `TextPreviewModal` / `UploadMaterialModal` | Which material-related modal is open and with what content (`/panel/nauka`). |
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
| `useSettingsStore.ts` | General user-settings UI state, distinct from `useSettingsModalStore` (that one is just the modal's open/closed state; this one likely holds the settings values being edited). |

---

**Audit note**: `useSettingsStore.ts` vs. `useSettingsModalStore.ts`, and `useMaterialModalStore.ts` backing three different modal components, are worth a quick confirmation pass that responsibilities don't blur — the store layer is otherwise cleanly one-store-per-concern.
