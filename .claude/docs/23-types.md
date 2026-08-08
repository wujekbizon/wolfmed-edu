# Types Catalog

[← Back to index](./README.md)

All 46 files in `src/types/`, one domain per file per Golden Rule #4. Listed with their key exported types/interfaces.

## Core data & actions

| File | Key exports | Domain |
|---|---|---|
| `actionTypes.ts` | `FormState`, `FormStateSignup` | The universal Server Action return shape used by every form in [`20-forms-catalog.md`](./20-forms-catalog.md). |
| `dataTypes.ts` | `Test`, `TestMeta`, `ExtendedTest`, `Procedure`, `Step`, `CompletedTest`, `UserData`, `User`, `BlogPost`, `BlogCategory`, `BlogTag`, `BlogLike`, `CreateBlogPostInput`, `BlogStatistics`, … | The largest, oldest catch-all file — core test/procedure/user/blog shapes. Candidate for splitting further per Golden Rule #4 if it keeps growing (audit note). |
| `resourceTypes.ts` | `Resource`, `ResourcesResponse` | The `@resource` attachment shape returned by `/api/mcp/resources` (see [`14-api-routes.md`](./14-api-routes.md)). |
| `uiTypes.ts` | `SelectOption` | Generic shared UI primitive type. |
| `iconTypes.ts` | `IconAttributes` | Shared icon component prop shape. |
| `index.ts` | `InputValues` | Legacy multi-select form input shape (see `enums.ts`). |
| `enums.ts` | `SelectedOptions1`–`5` | String enums backing a legacy multi-step selection form (Polish-language option labels). |
| `testData.ts` | `TestDataInterface` (default), `AvailableOption`, `TestsData` | Legacy/earlier test data shape — check for overlap with `dataTypes.ts`'s `Test`/`TestMeta` (audit note: possible duplication to reconcile). |

## Tests, categories, analytics

| File | Key exports |
|---|---|
| `categoryType.ts` | `PopulatedCategories`, `CategoryPageProps`, `AccessTier`, `CategoryDetails`, `CategoryMetadata` |
| `analyticsTypes.ts` | `TimelinePoint`, `ProblematicQuestion` |
| `aiTestTypes.ts` | `GeneratedAnswer`, `GeneratedQuestion` |
| `generatedQuizTypes.ts` | `AiChallengeType`, `GeneratedQuizQuestion`, `GeneratedKnowledgeQuiz`, `GeneratedSpotErrorQuiz`, `GeneratedScenarioQuiz`, `GeneratedQuizData`, `GeneratedQuizPlayView` — `GeneratedQuizPlayView` is the answer-stripped shape sent to the client (see `stripQuizAnswers` in [`25-helpers.md`](./25-helpers.md)). |
| `quizUiTypes.ts` | `QuizPhase`, `QuizIntroProps`, `KnowledgeQuizPlayerProps`, `SpotErrorPlayerProps`, `ScenarioPlayerProps`, `QuizReviewItem`, `ChallengesHubProps` |
| `challengeTypes.ts` | `ChallengeCompletion`, `Badge`, `ProcedureProgress`, `ActionResult` (a generic `{success, data?, error?}` wrapper used across several actions beyond just challenges) |

## Procedures & practical exams

| File | Key exports |
|---|---|
| `pielegniastwoTypes.ts` | `PielegniastwoStep`, `PielegniastwoSection`, `PielegniastwoProcedure` — the `pielegniarstwo`-course-specific procedure shape (distinct from the generic `Procedure` in `dataTypes.ts` used by `opiekun-medyczny`). |
| `procedureReaderTypes.ts` | `OpiekunReaderSection`, `ReaderDirection` |
| `praktycznyTypes.ts` | `PracticalPatient`, `AssessedTask`, `ExamForm`, `PracticalExam`, the parallel `Public*` types (`PublicExamForm`, `PublicExam`, …, answer-stripped for client transport), `ExamAnswers`, `ExamResult`, `PracticalExamState` — the full practical-exam domain. |
| `examCountdownTypes.ts` | `ExamPeriod`, `TimeLeft`, `ExamStatus` |
| `mannequinTypes.ts` | `MannequinViewKey`, `MannequinView`, `CameraPosition`, `MannequinZoneMap` — 3D mannequin viewer (procedure visual recognition, `@react-three/fiber`). |
| `humanCellTypes.ts` | `ShapeType`, `Vector2`, `Size2D` — geometry primitives for anatomical diagrams. |

## Diagnozy

| File | Key exports |
|---|---|
| `diagnozyTypes.ts` | `Diagnoza`, `DiagnozyFile`, `DiagnozaInterwencja`, `DiagnozaListItem`, `DiagnozyBrowseCriteria`, `DiagnozyChapter`, `DiagnozyExamAttempt`, `DiagnozaFormulation`, `DiagnozyExamPayload`, `DiagnozyExamResult`, `BodyZoneAssignments`, … — the largest single-domain type file, matching the schema complexity of the `diagnozy`/`diagnozyExamAttempts` tables. |

## Forum, blog, messages

| File | Key exports |
|---|---|
| `forumPostsTypes.ts` | `Comment`, `Post`, `ForumData`, `ForumNotifications`, `ForumStats`, `RecentForumPost`, `ForumSeenScope` |
| `messagesTypes.ts` | `MessageStats` |

(Blog types live in `dataTypes.ts`, not a separate file — see audit note above.)

## Notes, materials, flashcards, cells

| File | Key exports |
|---|---|
| `notesTypes.ts` | `NotesType` |
| `materialsTypes.ts` | `MaterialsType` |
| `flashcardTypes.ts` | `FlashcardSource`, `Flashcard`, `FlashcardDeck`, `FlashcardCellContent` |
| `cellTypes.ts` | `CellTypes`, `Cell`, `UserCellsList`, `MediaCellContent`, `LearningStep`, `LearningPlan` — the "board cell" content-union shapes stored in `userCellsList` (mind map cells, media cells, flashcard cells, RAG chat cells, diagram cells all plug into this union). |

## Mind maps & diagrams

| File | Key exports |
|---|---|
| `mindmapTypes.ts` | `Category`, `TopicType`, `MasteryLevel`, `MindMapNodeMetadata`, `MindMapNode`, `MindMap`, `MindMapCellContent` |
| `mindmapControlsTypes.ts` | `MindMapControlsProps` |
| `mindmapFocusTypes.ts` | `FocusKind`, `FocusRequest` |
| `diagramTypes.ts` | `DiagramNodeRole`, `DiagramRoleMap`, `DiagramSelection`, `DiagramGroup`, `ExcalidrawScene`, `DiagramCellContent` |
| `shapes.ts` | `FloatingShape`, `ShapeConfig` — decorative landing-page shapes, unrelated to the diagram/mind-map domain despite the similar name. |

## AI tutor / RAG / commands

| File | Key exports |
|---|---|
| `retrievalTypes.ts` | `ChunkOrigin`, `ContextChunk`, `RetrievalMode` (closed union of exactly 3: `'canonical_only' \| 'canonical_with_personal' \| 'explicit_resource'` — full explanation in [`00-architecture.md`](./00-architecture.md), not an open-ended example list), `RetrieveContextOptions`, `SourceRef`, `RetrievedContext` — the types behind `retrieveContext()`. |
| `ragCellTypes.ts` | `RagMessage`, `RagExplainOrigin`, `RagCellContent` |
| `commandTypes.ts` | `CommandCountSpec`, `ToolCommand`, `Command` — the `/commands` system (see `TOOL_COMMANDS` in [`24-constants.md`](./24-constants.md)). |
| `progressTypes.ts` | `ProgressStage`, `LogAudience`, `LogLevel`, `ConnectionState`, `ProgressData`, `SSEProgressData`, `UseRagProgressReturn`, `EventType`, `ProgressEvent`, `JobProgress` — backs the `/api/rag/progress` SSE stream and `useRagProgress`. |
| `speechTypes.ts` | `SpeechRecognition`, `SpeechRecognitionErrorEvent`, `SpeechRecognitionEvent`, `SpeechRecognitionAlternative` — Web Speech API type shims (not shipped by default TS lib types), backs `useSpeechRecognition`. |
| `generationModalTypes.ts` | `AIGenerationModalProps` |

## Planner

| File | Key exports |
|---|---|
| `plannerTypes.ts` | `PlanGoalType`, `PlanStatus`, `PaceStatus`, `ConceptSource`, `PlanWithConcepts`, `ConceptProgress`, `DailySuggestion`, `PlanProgress`, `ConceptCatalogEntry`, `ExamDatePreset`, `PlanWizardProps` |

## Marketing / pricing / paths

| File | Key exports |
|---|---|
| `careerPathsTypes.ts` | `CurriculumBlock`, `Testimonial`, `PathData`, `PathLayoutProps` — backs `careerPathsData` and `RichPathLayout`/`SimplePathLayout` (see [`10-pages-public.md`](./10-pages-public.md)). |
| `pathStoryTypes.ts` | `StoryScene`, `PathFact`, `PathStory`, `PathStep`, `CareerPath` |
| `pricingTypes.ts` | `ComparisonValue`, `ComparisonRow`, `ComparisonGroup` — pricing/tier comparison table shape. |
| `productsTypes.ts` | `Product` |
| `stripeTypes.ts` | `Subscription`, `Payment`, `Supporter` |

## Admin

| File | Key exports |
|---|---|
| `adminNavTypes.ts` | `AdminNavBadgeKey`, `AdminNavLink`, `AdminNavBadges`, `AdminNavVariant` |

## Ambient / build

| File | Purpose |
|---|---|
| `server-only.d.ts` | Ambient module declaration (no runtime exports) — type shim so `import 'server-only'` type-checks. |

---

**Audit notes** (deviations from Golden Rule #4 worth reconciling, not fixed here since it's out of scope for a documentation pass):
- `dataTypes.ts` is a large multi-domain catch-all (tests, procedures, users, blog) rather than one-domain-per-file; blog types in particular could move to a `blogTypes.ts`.
- `testData.ts` (legacy `TestDataInterface`/`TestsData`) is confirmed **live**, not dead (imported by `src/helpers/extractAnswerData.ts` — checked in round 2 of doc-testing, see [`README.md`](./README.md) audit note #3). Still worth reconciling with `dataTypes.ts`'s overlapping `Test`/`TestMeta` at some point, but it's real code, not a stray file.
- `shapes.ts` and the diagram/mind-map type files share the word "shape"/"scene" but are unrelated domains — no action needed, just a naming note for readers.
