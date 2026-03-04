# Flashcard Improvements Plan

## Current State Summary

**Flow:** User enters Study Mode → selects text → clicks "Fiszka" in toolbar → modal opens with selected text pre-filling the **question** field → user types answer → submits → flashcard saved to Zustand (localStorage).

**Key files:**
- `src/store/useFlashcardStore.ts` — Zustand store with localStorage persistence
- `src/hooks/useFlashcards.ts` — hook to retrieve flashcards for a note
- `src/components/StudyViewer.tsx` — main note viewer with study features
- `src/components/StudyToolbar.tsx` — toolbar with flashcard buttons
- `src/components/FlashcardCreateModal.tsx` — creation modal
- `src/components/FlashcardReviewModal.tsx` — review/study modal
- `src/constants/studyViewer.ts` — Polish UI text constants

---

## Bug Fix: Flashcards don't appear without page refresh

**Root cause:** `src/hooks/useFlashcards.ts` line 11

```typescript
const getFlashcardsByNoteId = useFlashcardStore((state) => state.getFlashcardsByNoteId)
```

This subscribes to the `getFlashcardsByNoteId` **function reference**, which never changes. The component never re-renders when flashcards are added/removed because Zustand only triggers re-renders when the selected slice of state changes.

**Fix:** Subscribe to `state.flashcards` directly and derive the filtered list:

```typescript
// src/hooks/useFlashcards.ts
export function useFlashcards(noteId: string) {
  const flashcards = useFlashcardStore((state) =>
    state.flashcards
      .filter((card) => card.noteId === noteId)
      .map((card) => ({
        cardId: card.id,
        questionText: card.questionText,
        answerText: card.answerText,
      }))
  )
  const removeFlashcard = useFlashcardStore((state) => state.removeFlashcard)

  return { flashcards, removeFlashcard }
}
```

This makes the component react to any change in the `flashcards` array. The `refreshFlashcards` no-op can be removed — all consumers just use `flashcards` directly (it's already auto-reactive).

**Files to change:** `src/hooks/useFlashcards.ts`, remove `refreshFlashcards` usage from `StudyViewer.tsx`

---

## Feature: Text Selection → Flashcard (Floating Tooltip)

### Problem
Currently the user must: select text → find and click toolbar button → modal opens → edit fields → submit. The toolbar button is disconnected from where the selection happens, and the selected text goes into the **question** field, which is backwards for study (the note content is the *answer* you want to recall).

### Solution: Floating Selection Tooltip

When the user selects text in study mode, a small floating tooltip appears near the selection with a quick "Create Flashcard" option. The selected text pre-fills the **answer** field (since it's note content the user wants to memorize), and the user only needs to type the question.

### Implementation Steps

#### Step 1: Create `useTextSelection` hook
**File:** `src/hooks/useTextSelection.ts` (new)

Custom hook that:
- Listens to Lexical editor selection changes (using `editor.registerUpdateListener`)
- When a range selection exists in study mode, captures:
  - `selectedText` (string)
  - `selectionRect` (DOMRect for positioning the tooltip)
- Clears state when selection is collapsed or lost
- Returns `{ selectedText, selectionRect, clearSelection }`

#### Step 2: Create `SelectionTooltip` component
**File:** `src/components/SelectionTooltip.tsx` (new)

Small floating tooltip component that:
- Receives `selectionRect` and positions itself above/below the selection
- Shows a `BookmarkPlus` icon + "Utwórz fiszkę" button
- On click, calls `onCreateFlashcard(selectedText)` callback
- Uses `position: fixed` + calculated coords from `selectionRect`
- Smooth fade-in animation
- Dismisses when clicking outside or when selection changes

#### Step 3: Update `FlashcardCreateModal`
**File:** `src/components/FlashcardCreateModal.tsx`

- Add a new optional prop: `selectedAsAnswer?: boolean`
- When `selectedAsAnswer` is true AND `selectedText` is provided → pre-fill the **answer** field instead of question
- When coming from the floating tooltip → `selectedAsAnswer=true` (text is answer, user types question)
- When coming from the toolbar "Fiszka" button → keep current behavior (text is question) for backwards compatibility
- The answer field becomes a `textarea` (already is) and the question `input` gets autofocus when answer is pre-filled

#### Step 4: Wire it up in `StudyViewerContent`
**File:** `src/components/StudyViewer.tsx`

- Import and use `useTextSelection` hook
- Render `SelectionTooltip` when `isStudyMode && selectedText`
- On tooltip click → open `FlashcardCreateModal` with `selectedAsAnswer={true}`
- Keep the existing toolbar "Fiszka" button flow as-is (backwards compatible)

#### Step 5: Add new constants
**File:** `src/constants/studyViewer.ts`

Add tooltip text:
```typescript
export const SELECTION_TOOLTIP_TEXT = {
  createFlashcard: 'Utwórz fiszkę',
}
```

### Data Flow (New)

```
User selects text in editor (study mode ON)
         ↓
useTextSelection hook detects range selection
         ↓
SelectionTooltip appears near selection
         ↓
User clicks "Utwórz fiszkę"
         ↓
FlashcardCreateModal opens with selectedText as ANSWER
         ↓
User types the QUESTION (autofocused)
         ↓
Submit → useFlashcardStore.addFlashcard()
         ↓
Component re-renders instantly (bug fix) — count updates in toolbar
```

### Data Flow (Existing — unchanged)

```
User clicks "Fiszka" button in toolbar
         ↓
Any selected text captured → fills QUESTION field
         ↓
User types answer → submits
```

---

## Summary of Changes

| # | Type | File | Change |
|---|------|------|--------|
| 1 | Bug fix | `src/hooks/useFlashcards.ts` | Fix Zustand selector to subscribe to `state.flashcards` |
| 2 | Cleanup | `src/components/StudyViewer.tsx` | Remove `refreshFlashcards` usage (no longer needed) |
| 3 | New | `src/hooks/useTextSelection.ts` | Hook for Lexical text selection tracking |
| 4 | New | `src/components/SelectionTooltip.tsx` | Floating tooltip near selected text |
| 5 | Update | `src/components/FlashcardCreateModal.tsx` | Support `selectedAsAnswer` prop |
| 6 | Update | `src/components/StudyViewer.tsx` | Integrate tooltip + new modal flow |
| 7 | Update | `src/constants/studyViewer.ts` | Add tooltip text constants |

**No changes to:** Zustand store, FlashcardReviewModal, StudyToolbar, FlashcardPlugin, FlashcardNode, server actions, DB schema.

**Reusing existing:** `useFlashcardStore`, `FlashcardCreateModal`, `FLASHCARD_MODAL_TEXT`, Lexical editor APIs (`$getSelection`, `$isRangeSelection`).
