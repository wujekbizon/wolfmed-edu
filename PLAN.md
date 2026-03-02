# Plan: Merge `/utworz` AI Tool with `/panel/dodaj-test` Manual Creation

## Problem Statement

Currently, the `/utworz` slash command (in RAG AI system) and the `/panel/dodaj-test` page are **completely disconnected**:

- **`/utworz`** generates test questions via AI (Gemini) and returns raw JSON in the RAG response — the user has to manually copy JSON and import it via the file upload form. No `cellType` is set, so no cell is created.
- **`/panel/dodaj-test`** provides manual form-based test creation (one question at a time) and JSON file upload. Works with `userCustomTests` DB table directly.

**Goal**: When the user runs `/utworz`, AI-generated questions should be presented as **reviewable draft cards** (similar to how `/notatka` creates a draft note cell) and allow the user to **review, edit, and save them directly to their `userCustomTests` database** — reusing the existing `createTestAction`/`uploadTestsFromFile` infrastructure.

---

## Architecture Decision

### Approach: "Test" Cell Type with Draft Preview + Batch Save

Rather than navigating the user to `/panel/dodaj-test`, we keep them in the cells workspace and:

1. Add `"test"` as a new cell type
2. `/utworz` sets `cellType: 'test'` on its result (like `/notatka` sets `cellType: 'note'`)
3. A new `TestCellPreview` component renders the generated questions as interactive cards (reusing `CustomTestCard`-style UI)
4. User can review, edit individual questions, remove bad ones, pick a category
5. On "Save" — questions are batch-inserted into `userCustomTests` via a new server action that reuses existing validation (`TestFileSchema`)

This is the **least disruptive** approach: it follows the established `/notatka` → draft cell → save pattern, reuses existing DB schema + validation, and keeps the user in their workflow.

---

## Implementation Steps

### Step 1: Extend Cell Types to Include `"test"`

**File**: `src/types/cellTypes.ts`

- Add `"test"` to `CellTypes` union: `"note" | "rag" | "draw" | "test"`
- This allows `insertCellAfterWithContent()` to create test cells

### Step 2: Update `/utworz` Tool to Set `cellType: 'test'`

**File**: `src/server/tools/executor.ts` → `utworzTool()`

Currently `utworzTool()` returns:
```ts
return {
  content: JSON.stringify({ questions }, null, 2),
  metadata: { count, category, displayFormat: 'json' }
}
```

Change to:
```ts
return {
  cellType: 'test',  // ← NEW: triggers cell creation
  content: JSON.stringify({ questions }, null, 2),
  metadata: { count, category, generated: new Date().toISOString() }
}
```

This makes `RagCellForm`'s existing `useEffect` automatically call `insertCellAfterWithContent(cell.id, 'test', jsonContent)`, creating a test cell in the workspace.

### Step 3: Create `TestCellPreview` Component

**File**: `src/components/cells/TestCellPreview.tsx` (new)

This is the **core UI piece**. It renders inside the cell list when `cell.type === 'test'`.

**Behavior**:
- Parse `cell.content` (JSON string) into an array of test questions
- Render each question as an editable card (reuse styling from `CustomTestCard`)
- Allow per-question actions: **Edit**, **Remove**
- Category selector at the top (defaults to the AI-suggested category, but user can change or pick from existing categories)
- Bottom action bar: **"Zapisz wszystkie" (Save All)** and **"Odrzuć" (Discard)**
- "Save All" calls a new `saveAIGeneratedTestsAction` server action
- "Discard" removes the cell from the store
- After successful save, the cell can either be removed or converted to a read-only summary ("5 questions saved to category X")

**Sub-components to reuse/reference**:
- `CustomTestCard` styling for question rendering
- `CategorySelection` component pattern for category picker
- `useCellsStore.deleteCell()` for discard

### Step 4: Create `TestQuestionEditor` Inline Editor

**File**: `src/components/cells/TestQuestionEditor.tsx` (new)

When user clicks "Edit" on a question within `TestCellPreview`:
- Switches that card to edit mode (inline, no modal)
- Shows editable fields: question text, answer options, correct answer toggle
- Reuses the same field layout as `CreateTestForm` / `Answers` component
- "Save" updates the local state, "Cancel" reverts

### Step 5: Create Server Action for Batch Save

**File**: `src/actions/actions.ts` — add `saveAIGeneratedTestsAction`

```ts
export async function saveAIGeneratedTestsAction(
  formState: FormState,
  formData: FormData
): Promise<FormState>
```

**Logic**:
1. Auth check + enrollment check (reuse pattern from `createTestAction`)
2. Rate limit check (reuse `test:create` limiter)
3. Extract JSON from formData (`questionsJson` field)
4. Parse and validate against `TestFileSchema` (already exists)
5. Batch insert via `db.transaction()` (reuse pattern from `uploadTestsFromFile`)
6. Revalidate `/panel/dodaj-test` and `/panel/testy`
7. Return success with count

This **directly reuses** the existing `TestFileSchema` validation and the transaction pattern from `uploadTestsFromFile`. No new schema needed.

### Step 6: Register Test Cell in Cell Renderer

**File**: The component that switches on `cell.type` to render different cell UIs.

Add case for `type === 'test'` → render `<TestCellPreview cell={cell} />`

Need to find the existing cell renderer (likely in `src/components/cells/` — the component that maps `cell.type` to `NoteCellForm`, `RagCellForm`, `Excalidraw`, etc.) and add the test case.

### Step 7: Wire Up the Cell Toolbar

The cell toolbar (add cell buttons) likely has buttons for "note", "rag", "draw". We do **NOT** add a "test" button there — test cells are only created via `/utworz` command, not manually from the toolbar. The manual creation flow stays at `/panel/dodaj-test`.

---

## File Changes Summary

| File | Change | Type |
|------|--------|------|
| `src/types/cellTypes.ts` | Add `"test"` to CellTypes union | Edit |
| `src/server/tools/executor.ts` | Add `cellType: 'test'` to `utworzTool()` return | Edit |
| `src/components/cells/TestCellPreview.tsx` | New component: draft test review UI | New |
| `src/components/cells/TestQuestionEditor.tsx` | New component: inline question editor | New |
| `src/actions/actions.ts` | Add `saveAIGeneratedTestsAction` | Edit |
| Cell renderer component | Add `test` case to cell type switch | Edit |

---

## Code Reuse Map

| Existing Code | Reused In |
|---|---|
| `TestFileSchema` (src/server/schema.ts) | Validation in `saveAIGeneratedTestsAction` |
| `uploadTestsFromFile` transaction pattern | Batch insert logic |
| `CustomTestCard` styling/layout | `TestCellPreview` question rendering |
| `CategorySelection` pattern | Category picker in `TestCellPreview` |
| `Answers` component pattern | `TestQuestionEditor` answer fields |
| `useCellsStore.deleteCell()` | Discard action |
| `useCellsStore.updateCell()` | After-save state update |
| `insertCellAfterWithContent` (existing useEffect in RagCellForm) | Auto-creates test cell (no change needed) |
| Auth + enrollment + rate limit pattern | `saveAIGeneratedTestsAction` |

---

## Data Flow (After Implementation)

```
User: "@anatomy.pdf /utworz 10 pytań o sercu"
    ↓
parseMcpCommands() → tools: ["utworz"], resources: ["anatomy.pdf"]
    ↓
askRagQuestion() → executeToolWithContent("utworz_test", ...)
    ↓
utworzTool() returns:
  { cellType: "test", content: '{"questions": [...]}', metadata: {...} }
    ↓
RagCellForm useEffect detects cellType === "test"
  → insertCellAfterWithContent(cellId, "test", jsonContent)
    ↓
Cell renderer sees type === "test"
  → renders <TestCellPreview cell={cell} />
    ↓
User sees 10 question cards with:
  - Category selector (pre-filled from AI)
  - Each question rendered as a card
  - Edit/Remove per question
  - "Zapisz wszystkie" / "Odrzuć" buttons
    ↓
User clicks "Zapisz wszystkie"
  → saveAIGeneratedTestsAction(formData with JSON)
  → TestFileSchema validation
  → db.transaction() batch insert to userCustomTests
  → revalidatePath("/panel/dodaj-test", "/panel/testy")
  → Cell updates to show "✓ Zapisano 10 pytań"
    ↓
Questions now appear in /panel/dodaj-test (Manage tab)
and are available in /panel/testy for test-taking
```

---

## Edge Cases to Handle

1. **Empty generation** — AI returns 0 questions → Show error message in cell, don't create empty test cell
2. **Invalid JSON from AI** — Already handled in `utworzTool()` with try/catch
3. **Partial save** — Transaction ensures all-or-nothing
4. **Category normalization** — Lowercase before save (existing pattern)
5. **Duplicate save prevention** — After save, disable the save button / show saved state
6. **Large question sets** — Cap at 50 questions per `/utworz` call (add validation)

---

## Access Control & Marketplace Tier Model

This section ties the feature to the marketplace model described in `MIGRATION_GUIDE.md`. The platform has two tiers per course: `basic` and `premium` (`free < basic < premium < pro`). The RAG/AI system is already an established premium feature.

### The Two Operations Have Different Tier Requirements

| Operation | Gate | Why |
|---|---|---|
| **AI generation** — running `/utworz` via RAG | `premium` | Already enforced. `askRagQuestion()` calls `checkPremiumAccessAction()` at the top — blocks before Gemini is called. No change needed. |
| **Batch save** — `saveAIGeneratedTestsAction` | **enrollment** (any active tier) | Saving is a data persistence operation, not an AI operation. Matches `createTestAction` and `uploadTestsFromFile` which also only require enrollment. |

### Why Not Gate Both at Premium?

At first glance it seems consistent to require premium for save too. But there are two strong reasons against it:

1. **The premium gate already ran.** A test cell only exists because `/utworz` was called, which requires premium. Blocking save would mean: user ran premium-gated AI, saw the result, but can't persist it. That's a broken UX with no security benefit.

2. **It breaks the existing pattern.** `createTestAction` and `uploadTestsFromFile` (the manual equivalents) are enrollment-gated. Saving AI-generated questions is the same DB operation — gating it higher creates inconsistency. Basic users can upload a JSON file of 100 questions; they shouldn't have a harder time saving 10 AI-generated ones.

**Exception / defense-in-depth**: `saveAIGeneratedTestsAction` must still validate enrollment (not just auth) because it can technically be called directly via crafted requests, bypassing the UI. This mirrors how `createTestAction` protects itself.

### Clear Value Proposition Per Tier

```
free      → can browse courses, limited content access
basic     → full course content, can take tests, can manually create questions (/panel/dodaj-test)
premium   → everything in basic + RAG AI notebook, /notatka, /diagram, /podsumuj, /utworz
                         └── AI-generated tests are saved as userCustomTests → accessible to basic+ in /panel/testy
```

This maps well to the marketplace pitch: premium unlocks the AI lab. The *output* of that lab (saved questions) integrates back into the basic-tier test system, reinforcing the value of premium without locking away already-created artifacts.

### What This Means for `saveAIGeneratedTestsAction`

```ts
// In saveAIGeneratedTestsAction:
const user = await getCurrentUser()
if (!user) throw new Error("Unauthorized")

// Enrollment check — same as createTestAction
const { enrollments } = await getUserEnrollmentsAction()
if (enrollments.length === 0) {
  return toFormState("ERROR", "Ta funkcja jest dostępna tylko dla użytkowników z aktywnym kursem.")
}

// Rate limit — reuse existing test:create limiter
// ... rest of batch save
```

No `checkPremiumAccessAction()` call here — the premium gate already ran upstream.

### UI Considerations

`TestCellPreview` (the component rendering the draft test questions) does not need its own premium lock. The cell can only exist if `/utworz` was called, which is already premium-gated. If a user's subscription lapses after they generated questions (edge case), they should still be able to save them — that's the fair behavior.

### No Changes Needed to Existing Access Control

The three-layer premium gate in `askRagQuestion()` (Layer 1: server action check, Layer 2: `checkPremiumAccessAction()`, Layer 3: UI disabled buttons) covers `/utworz` completely. This was implemented per the plan in `IMPLEMENTATION_PLAN_V2.md` and is already live.

---

## What We Are NOT Changing

- `/panel/dodaj-test` page stays as-is (manual creation + JSON upload)
- `CreateTestForm` stays as-is
- `UploadTestForm` stays as-is
- `createTestAction` stays as-is (single question creation)
- No new database tables or schema changes
- No changes to the `userCustomTests` table structure
- Cell toolbar does not get a "test" button
