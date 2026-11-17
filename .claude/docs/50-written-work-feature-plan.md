# Praca pisemna implementation plan

Implementation added 2026-11-17. Greg owns manual verification and requested skipping tests and builds for this implementation.

## Product decisions

- Add a Premium `essay` Cell named **Praca pisemna** in Pracownia AI.
- Support `pielegniarstwo` and `opiekun-medyczny`, with access checked for the selected course.
- Collect course, topic, work type, optional required sections/existing outline, and optional additional instructions.
- Use **Wymagania → Plan → Treść**, with sources accessible throughout review.
- Gemini proposes the length when preparing the outline. Display that target before approval. Instructions can specify another target.
- Generate from the corpus and explicitly selected PDF/TXT materials. Explain missing evidence and allow the user to add sources or revise scope.
- Edit the result in the existing Lexical editor. Save through existing Cell Save/Sync.
- **Pobierz PDF** downloads the current editor snapshot. The editable work is saved through Cell Save/Sync.
- The exported PDF includes the existing document-level source names and origins under **Źródła**.
- AI generation requires current selected-course Premium access. Existing owned drafts remain editable and downloadable after Premium expires, subject to the existing panel access rules. Source uploads follow the current course/storage entitlement.

## Verified reuse

| Responsibility | Existing implementation | Planned extension |
| --- | --- | --- |
| Cell registration and rendering | `constants/cellButtons.ts`, `types/cellTypes.ts`, `components/cells/{AddCell,CellContent,index}.tsx`, `server/schema.ts` | Register `essay`, add lazy-loaded editor island and eligible-course props |
| Board persistence | `store/useCellsStore.ts`, `actions/cells.ts`, `helpers/cellsConcurrency.ts`, `server/queries.ts` | Store versioned essay content inside the existing Cell payload |
| Fullscreen and sizing | `CellListItem`, `CellFullscreenContext`, `ResizableComponent` | Use existing controls |
| Editing | `components/editor/Editor.tsx`, `EditorToolbar`, `editorConfig` | Initialize from generated Lexical JSON, retain subsequent edits |
| Text parsing | `helpers/safeJsonParse.ts`, `getLexicalContent.ts`, `lexicalToHtml.ts` | Reuse JSON parsing/plain-text extraction, add a typed Lexical-to-PDF adapter |
| Forms | Shared `Input`, `Select`, `Textarea`, `Checkbox`, `Button`, `SubmitButton`, `FieldError`, `FormError`, `useToastMessage` | Compose the essay brief and outline forms |
| Materials | `UploadMaterialForm`, `UploadMaterialModal`, `useMaterialModalStore`, `actions/materials.ts`, UploadThing `materialUploader` | Return uploaded material metadata, select it in the originating Cell, add TXT |
| Source selection | `getMaterialsByUser`, `getMaterialById`, existing React Query patterns | Return a small metadata projection for the picker, refresh pending preparation statuses |
| Retrieval | `server/retrieval/context.ts`, `readCorpus`, `getAttachedSourceText`, `formatContextChunks`, `dedupeContextSources` | Add one explicit mode for corpus plus chosen materials |
| Generation | `getGoogleAI`, `parseGoogleApiError`, `getModelTokenUsage`, mind-map structured response/repair patterns | Dedicated essay prompts and response validation using Gemini 2.5 Flash |
| Sources | `SourceRef`, `SourceChip`, `stripContextCitations` | Reuse display shape and citation cleanup |
| PDF | `@react-pdf/renderer`, existing server rendering/fonts, `downloadBrowserFile`, `PdfPreviewModal` | Essay document layout and server download action |
| Source storage | Existing material upload, `userLimits`, `indexSource`, `embedPendingChunks` | Reuse for PDF/TXT inputs |
| Access | `getUserEnrollments`, `checkCourseAccessAction`, `hasAccessToTier` | Enforce Premium on the selected medical course |

The current generic note form creates a note and clears its form after saving. The essay Cell uses its underlying Editor with essay-specific state handling. The existing HTML converter produces HTML, while the PDF adapter maps validated Lexical nodes to PDF components.

## Server and client boundaries

`NaukaCellsSection` loads the board, eligible courses, and source-material metadata on the server. Fetch independent inputs concurrently and send only the fields rendered by the UI. Retain the existing Suspense boundary and Cell skeleton.

Keep `page.tsx` as a shell. Browser responsibilities are editor interaction, outline ordering, upload interaction, panel selection, pending feedback, and local draft updates. Retrieval, access checks, schema validation, generation, PDF rendering, storage mutation, and indexing belong in `server-only` modules.

Use thin `use server` actions with `useActionState` and `FormState`. Every entry point authenticates, validates input, verifies the selected course when AI is requested, checks source ownership, and applies its rate limit before paid work. Authentication and authorization must also protect direct action requests. [Next.js data security](https://nextjs.org/docs/app/guides/data-security)

Server input schemas live in `src/server/schema.ts`, with feature schema definitions extracted into a server-only feature file and re-exported if needed to respect file size. Field errors use `fromErrorToFormState` and an empty message. Form-wide failures use the existing toast path. Return submitted values on failure.

Use React Query for material filtering/search/status refresh with user-scoped keys, server `initialData`, shared stale time, and `useDebouncedValue`. Keep form drafts in the Cell state. Mount upload/preview/confirmation modals at the existing page or layout host. Resolve upload success to the initiating Cell ID, even if another Cell gains focus.

## Draft representation and saving

Store a `schemaVersion: 1` essay payload in `Cell.content` containing the brief, selected material IDs, editable outline with stable section IDs, target words, approved brief fingerprint, material fingerprint, current Lexical JSON, and separate outline/document source references. Retain the generated document title when requirements are later edited.

Derive the visible workflow stage from saved content. Pending network state is transient. Treat an empty new Cell as a valid empty draft. Preserve older Cell payloads through the current parsing/hydration flow. Reject malformed essay content with a recoverable error that retains the draft.

Extend the Cell enum and validate essay payloads on the server at save and action boundaries. Reuse board version checks, dirty tracking, local persistence, and explicit Save/Sync. Flush editor changes before save/export snapshots. Restoring local or server state must retain the full brief, outline, text, and sources.

Capture an input fingerprint for each generation. Apply its result only if the initiating Cell still exists and the matching brief/outline is current. A changed or deleted Cell cannot receive a late response that overwrites newer work. Changing the brief, source selection, or outline invalidates approval while retaining the existing text for review.

A PDF download captures the current editor snapshot. Edits made while rendering continue to update the draft.

## Source preparation and retrieval

Add TXT to the existing uploader, allowed MIME types, material preparation, and error copy. Decode bounded UTF-8 text directly. Continue using the existing PDF extraction path. Both converge on stored `extractedText`, `indexSource`, and the embedding queue.

Return `{ id, title, type, indexStatus }` from a successful upload while preserving current callers. A new upload becomes selected in its originating essay. The picker shows preparing, ready, unavailable, and retry states. Source readiness depends on readable stored text. Embedding completion can follow separately.

For older or failed owned materials, expose an explicit **Przygotuj materiał** action using the existing preparation pipeline and a fresh Premium check. This also handles pre-upgrade `not_indexed` files selected by a now-eligible user. Concurrent retries must share a claimed attempt and avoid duplicate extraction.

Extend `RetrievalMode` with `canonical_with_explicit_resources`. Implement its policy inside `retrieveContext` using the existing readers. Include full selected material text as the primary supplied content and corpus results as supplementary content. Require every selected ID to resolve to an owned eligible material. Keep `hasCanonical` tied to actual corpus results in this mode.

The corpus is currently shared globally. The course determines access and writing context. Search queries contain only the medical subject or section subject. The selected-material path reads precisely the chosen files. Source assembly excludes student memory and automatically searched personal notes.

Retain existing relevance thresholds and ranking behavior. Add an explicit error policy for the essay retrieval path so a corpus outage surfaces as temporary unavailability. Existing callers retain their current policy. Validate the extension through normal `retrieveContext` entry points.

Bound complete attachment/context size before model calls. If selected files exceed the budget, name the files and ask the user to reduce selection. Preserve all selected content within the accepted budget.

## Generation pipeline

1. `prepareEssayOutlineAction` validates the brief and loads owned source text. Retrieve the main subject through `retrieveContext`. Requirements remain in the generation prompt. Empty usable context returns a source-gap result before Gemini is called.
2. Gemini 2.5 Flash returns a structured outline, proposed word allocation, supported sections, and concrete missing requirements. Validate structure and internal evidence references against the supplied context. A source gap remains visible until the user changes the brief/sources or explicitly accepts a narrower outline.
3. The user edits and approves the outline. Bind approval to the current brief, sections, and selected source versions. Keep required instructions visible during approval.
4. `generateEssayAction` rechecks access and source ownership, reloads source versions, and retrieves context for the approved section subjects with bounded concurrency. If sources changed, return to outline review. Client-submitted coverage flags cannot authorize generation.
5. One structured Gemini call composes the complete work or returns a gap result. Include every approved section and keep medical claims within supplied evidence. Treat source text and additional instructions as untrusted data relative to the grounding policy.
6. Validate section identity, completeness, output length, and internal evidence references. Run a separate grounded review against the same context to flag unsupported claims, missed requirements, or contradictions. On failure return actionable feedback and retain the previous document. This review reduces errors but requires real-source evaluation to assess semantic accuracy.
7. Convert accepted headings and paragraphs directly to Lexical JSON for the existing editor. Display deduplicated server-resolved source labels through `SourceChip`. Internal evidence references stay outside the rendered prose. After manual editing, the sources describe the generated draft's evidence and do not certify newly typed statements.

Reuse Google client, token accounting, error translation, and bounded structured-output repair patterns. Essay generation uses a dedicated prompt rather than the tutor's conversational persona. A normal complete workflow uses one outline call, one composition call, and one grounded-review call. Empty context uses zero generation calls. Formatting repair allows at most one additional call per failed phase.

Starting engineering budgets are a 3,000-word generation ceiling, eight outline sections, and 200,000 characters of combined source context. These are provisional implementation defaults, not an asserted academic average. Gemini chooses a target within those bounds. Put budgets, model name, output tokens, and cancellation deadlines in feature constants. Validate the caps and generation latency before release and tune from measurements.

Use bounded request lifetimes, explicit provider cancellation, and route duration compatible with the deployed environment. Pending UI uses the existing neutral-loading pattern. A timeout or invalid result retains the user's input and existing work. Persist successful results through the ordinary Cell save flow.

## PDF rendering and downloading

Create a server-side `EssayDocument` using the installed `@react-pdf/renderer`. Render A4 portrait with a title, section headings, paragraphs, lists, quotes, basic inline formatting, Polish characters, page numbers, and a final source list.

Reuse existing local font registration patterns and include required font assets in deployment tracing. Register the weights/styles actually exposed by the editor. Verify pagination, text selection, long headings, links, and Polish diacritics. [React PDF fonts](https://react-pdf.org/docs/v4/fonts)

The Lexical-to-PDF adapter accepts validated supported nodes and has bounded depth, node count, and text size. Use `parseLexicalContent` and `getLexicalContent` where applicable, adding strict node validation for this export boundary. Surface unsupported content explicitly so it can be corrected before export.

`downloadEssayPdfAction` receives the current edited snapshot, validates it, and calls the shared renderer. Return bounded base64 PDF data in the action result, then decode to a Blob and use `downloadBrowserFile`. This keeps form submissions on the project's Server Action path and permits export of current unsaved edits. Start with a 1 MiB generated-PDF cap, allowing for base64 and framework overhead below deployment response limits. Verify against the deployed environment.

Source PDF previews reuse `PdfPreviewModal` and the existing `react-pdf` viewer. Generation and PDF rendering remain independent, so downloading an unchanged work makes zero model calls.

## Database reuse

The approved scope uses existing tables and requires no database migration.

| Existing table | Responsibility |
| --- | --- |
| `userCellsList` | Brief, source selection, outline, Lexical document and source references in the existing Cell JSON |
| `materials` | PDF/TXT input materials through the existing upload flow |
| `userLimits` | Existing source-upload storage allowance |
| `lib_chunks` | Existing source preparation and searchable text |

PDF download renders the current editor snapshot and returns it to the browser. The essay remains editable in its Cell. Cell type and TXT support require application validation changes.

## Cell UX and layout

Use three views named **Wymagania**, **Plan**, and **Treść**. Combine source selection with the brief so users can prepare a work on one screen. Keep a single primary action at the bottom of each preparation view.

- The header shows **Praca pisemna** and the current save state. Reuse the outer Cell Save/Sync/fullscreen controls. Distinguish a local draft from a successful server save.
- **Wymagania** starts with course and work-type controls, followed by the full-width topic. Put optional required sections/existing outline in an expandable area. Keep the optional additional-information textarea visible. Source selection follows the form, with the knowledge base shown as included and buttons to select existing materials or upload PDF/TXT. Selected sources show their preparation state and an accessible remove action. The main action is **Przygotuj plan**.
- **Plan** shows the topic, proposed length, editable section titles and short descriptions. Each section has a compact accessible menu for moving/removing it. Include **Dodaj część** and a collapsible source list. The main action is **Zatwierdź i napisz**. Returning to Wymagania preserves the draft.
- Missing evidence appears beside the affected section with the specific missing subject. **Dodaj materiał** returns to the source controls. A required unsupported section blocks full generation. An explicit scope-edit action allows removal with confirmation when it changes a requirement. Preparation and service failures use distinct messages and retry controls.
- **Treść** gives most space to the existing Lexical editor and toolbar. Put word count and **Pobierz PDF** below it, with source names in an expandable **Źródła** area. Keep the outline accessible through its view. Generation and manual edits mark the board dirty until Save succeeds.
- Show pending feedback in the initiating action, prevent repeated submission while it is pending, and retain entered values. Successful stage transitions move focus to the new view heading. Announce errors and save state accessibly.
- At narrow Cell widths, stack the two selectors and allow action rows to wrap. Keep the editor full width. The fullscreen view uses the same composition with a comfortable text measure. Keyboard users can navigate the steps, section menus, source selection, and actions.

The interactive design preview uses illustrative content to exercise brief, outline, editor, source selection, missing evidence, and saving states. Production generation and saving are server-authoritative.

## File organization and project rules

- Feature components under `components/cells/essay/`, with one component per file and roughly 90–100 lines maximum.
- Feature hooks under `hooks/`, pure single-function helpers under `helpers/`, types in `types/essayTypes.ts`, and constants under `constants/`.
- Thin actions split by outline, generation, and download as size requires. Server services under `server/essays/`, PDF components under `server/essays/pdf/`.
- Reuse existing material and retrieval modules through narrow extensions. Check helpers, queries, and components again immediately before introducing each new function.
- Shared UI primitives, server-only Zod validation, field errors, toasts, layout-hosted modals, deterministic hydration, and single-line JSX class values follow `CLAUDE.md`.
- Revalidate `/panel/nauka` after material mutations and update/invalidate the affected user-scoped query. Auth-sensitive responses remain private. Database mutations stay uncached.
- Use the installed Next.js docs as the implementation reference. Current config allows 3 MB Server Action bodies. Bound feature payloads and account for the complete board envelope when saving.

## Manual verification

1. Open Pracownia AI, add Praca pisemna, enter a topic and optional requirements, and prepare the outline.
2. Exercise corpus-only, selected PDF, selected TXT, and missing/irrelevant source paths. Check uploaded files attach to the originating Cell and preparation states refresh.
3. Edit section titles/order/descriptions, approve the plan, generate text, and check required topics and source names against the underlying documents.
4. Edit text in Lexical, save the board, reload, and download the current document. Check Polish characters, bold/italic, headings, lists, page breaks, and source names.
5. Exercise multiple Cells, fullscreen/mobile widths, two-tab Save/Sync conflicts, input changes during generation, source deletion, and entitlement expiry.
6. Run the repository's type checks, lint, tests, and production build manually, then verify deployed PDF font tracing and live-provider latency.

Automated tests, type checks, lint, builds, live model calls, and PDF rendering checks were skipped at Greg's request. Grounding quality and runtime behavior require manual verification.

Initial rate limits are 10 outline requests/hour, 5 generated works/day, 30 downloads/hour, and 5 material-preparation requests/hour. They live in `src/lib/rateLimit.ts`. Provider cancellation is 150 seconds, with the learning page configured for a 300-second request budget. Provider requests log token usage through the existing helper.

Italic and bold-italic Noto Sans fonts are bundled with their OFL license for PDF rendering. Regular and bold fonts reuse the existing report assets.

## Completion criteria

- Eligible users can create, save, restore, edit, and export a grounded work through its Cell.
- Missing evidence produces concrete gaps and preserves the user's work.
- Selected-course authorization and source ownership hold at every relevant server entry point.
- Downloaded PDFs reflect the submitted editor snapshot and include source names.
- New TXT handling, source mode, and shared helper extensions preserve existing consumer behavior.

## Unresolved questions

None for implementation design. Initial resource budgets and grounding quality require validation before release.
