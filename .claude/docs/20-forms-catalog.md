# Forms Catalog

[← Back to index](./README.md)

Every form in the app follows the canonical pattern from root `CLAUDE.md` (reference implementation: `MottoForm.tsx`, used on `/panel`):

```
const [state, action] = useActionState(serverAction, EMPTY_FORM_STATE)   // src/constants/formState.ts
<form action={action}>
  <Input .../> <FieldError name="..." formState={state} />              // per field
</form>
const noScriptFallback = useToastMessage(state)                         // top-level toast
```

Validation is **server-only** — every schema below lives in `src/server/schema.ts` and is applied inside the Server Action, never on the client. `FormState` shape and `toFormState`/`fromErrorToFormState` helpers: `src/types/actionTypes.ts`, `src/helpers/toFormState.ts`.

Full per-action detail: [`21-server-actions.md`](./21-server-actions.md). This table is the reverse index: **form/page → action → schema → table written**.

---

## Public / marketing

| Form | Page | Action | Schema | Writes |
|---|---|---|---|---|
| `ContactForm` | `/` | `sendEmail` | `CreateMessageSchema` | `customersMessages` |

## Panel — profile & dashboard

| Form | Page | Action | Schema | Writes |
|---|---|---|---|---|
| `MottoForm` (reference impl.) | `/panel` | `updateMotto` | `UpdateMottoSchema` | `users.motto` |
| `UsernameForm` | `/panel` | `updateUsername` | `UpdateUsernameSchema` | `users.username` |
| `TestimonialForm` | `/panel` | `createTestimonialAction` | `CreateTestimonialSchema` | `testimonials` |
| `PreferencesForm` | `/panel/ustawienia` | `updatePreferencesAction` | validated against `PREFERENCE_DEFS`, not a `schema.ts` entry | `memPreferences` |

## Panel — tests & exams

| Form | Page | Action | Schema | Writes |
|---|---|---|---|---|
| Start-test control (in `TestsCategoriesList`/category page) | `/panel/testy/[value]` | `startTestAction` | `StartTestSchema` | `testSessions` |
| Test-taking submit (`GenerateTests`) | `/panel/testy/[value]` | `submitTestAction` | (answers validated via `CreateAnswersSchema(allowedLengths)`, a schema *factory* — the shape depends on question count) | `completedTestes`, `users` aggregates |
| Delete test control | admin/content tooling | `deleteTestAction` | `DeleteTestIdSchema` | `tests` |
| Practical exam submit (`PracticalExamRunner`) | `/panel/egzaminy/[slug]` | `gradePracticalExamAction` | `GradePracticalExamSchema` | (scoring — see `praktyczny.ts`) |
| AI practical exam generation | `/panel/egzaminy` flow | `generatePracticalExamAction` | `GeneratedPracticalExamSchema` | `generatedPracticalExams` |

## Panel — custom test authoring (`/panel/dodaj-test`, premium)

| Form | Action | Schema | Writes |
|---|---|---|---|
| Manual question entry (`CreateTestTabs`) | `createTestAction` | `CreateTestSchema` | `userCustomTests` |
| Bulk file upload | `uploadTestsFromFile` | `TestFileSchema` | `userCustomTests` |
| AI generation preview | `generateAITestsAction` | `GenerateAITestsSchema` | (preview only — `FormState.values`) |
| Save AI-generated set | `saveAIGeneratedTestsAction` | (validates the previewed set) | `userCustomTests` |
| Create custom category | `createCustomCategoryAction` | `CreateCustomCategorySchema` | `userCustomCategories` |
| Rename category | `updateCategoryNameAction` | `UpdateCategoryNameSchema` | `userCustomCategories` |
| Add/remove question to category | `addQuestionToCategoryAction` / `removeQuestionFromCategoryAction` | `AddQuestionToCategorySchema` / `UpdateCategoryQuestionsSchema` | `userCustomCategories.questionIds` |
| Delete category | `deleteCustomCategoryAction` | `DeleteCustomCategorySchema` | `userCustomCategories` |
| `DeleteTestModal` | `deleteUserCustomTestAction` | — | `userCustomTests` |
| `DeleteCategoryModal` / `CategoryDeleteModalWrapper` | `deleteUserCustomTestsByCategoryAction` / `deleteCustomCategoryAction` | `DeleteCategorySchema` | `userCustomTests`, `userCustomCategories` |

## Panel — notes, cells, materials, flashcards (`/panel/nauka`)

| Form | Action | Schema | Writes |
|---|---|---|---|
| Note create (`NotePageContent` / new-note control) | `createNoteAction` | `NoteSchema` | `notes` |
| Note update | `updateNoteContentAction` | `NoteUpdateSchema` (`NoteSchema.partial()`) | `notes` |
| Note delete | `deleteNoteAction` | `DeleteNoteIdSchema` | `notes` |
| Board/cells save (`NaukaCellsSection`, `DynamicBoard`) | `saveCellsAction` | `CellSchema` / `UserCellsListSchema` | `userCellsList` |
| `UploadMaterialModal` | `uploadMaterialAction` | `MaterialsSchema` | `materials` |
| Material delete | `deleteMaterialAction` | `DeleteMaterialIdSchema` | `materials` |
| Flashcard deck create (generated) | `createGeneratedDeckAction` | `CreateGeneratedDeckSchema` | `flashcardDecks` |
| Flashcard deck create (empty/manual) | `createEmptyDeckAction` | `DeckNameSchema` | `flashcardDecks` |
| Flashcard deck from note | `createNoteFlashcardAction` | `CreateNoteFlashcardSchema` | `flashcardDecks`, `flashcards` |
| Deck rename | `renameFlashcardDeckAction` | `RenameDeckSchema` | `flashcardDecks` |
| Deck delete | `deleteFlashcardDeckAction` | `DeckIdSchema` | `flashcardDecks` |
| Card create/update/delete | `createFlashcardAction` / `updateFlashcardAction` / `deleteFlashcardAction` | `CreateFlashcardSchema` / `UpdateFlashcardSchema` / `FlashcardIdSchema` | `flashcards` |
| Mind map generation (cell content) | `generateMindMapAction` | `GenerateMindMapSchema` (nodes: `MindMapNodeSchema`) | `userCellsList` (cell content) |
| PPTX import | `importPptxAction` | (file-based, parsed via `src/lib/parsePptx.ts`) | notes/materials (via downstream note creation) |

## Panel — procedures, challenges, diagnozy

| Form | Page | Action | Schema | Writes |
|---|---|---|---|---|
| `OrderStepsChallenge` submit | `.../wyzwania/order-steps` | `submitOrderStepsAction` | `SubmitOrderStepsSchema` | `challengeCompletions`, `procedureBadges` |
| AI quiz generation | `.../wyzwania/[type]` | `generateProcedureQuizAction` | `GenerateProcedureQuizSchema` (variants: `GeneratedKnowledgeQuizSchema`, `GeneratedSpotErrorQuizSchema`, `GeneratedScenarioQuizSchema`) | `generatedQuizzes` |
| AI quiz submit | `.../wyzwania/[type]` | `submitGeneratedQuizAction` | `SubmitGeneratedQuizSchema` | `challengeCompletions` |
| `WypelnijRunner` submit | `/panel/diagnozy/[slug]` | `markDiagnozaCompletedAction` | `MarkDiagnozaCompletedSchema` | `diagnozyProgress` |
| Diagnozy fill-in data fetch | `/panel/diagnozy/[slug]` | `getDiagnozaFillDataAction` | (read-only) | — |
| `EgzaminRunner` start/submit | `/panel/diagnozy/egzamin` | `startDiagnozyExamAction` / `submitDiagnozyExamAction` | — / `SubmitDiagnozyExamSchema` | `diagnozyExamAttempts` |

## Panel — planner

| Form | Action | Schema | Writes |
|---|---|---|---|
| `PlanWizard` create | `createPlanAction` | `CreatePlanSchema` | `learningPlans`, `learningPlanConcepts` |
| Plan edit | `updatePlanAction` | `UpdatePlanSchema` | `learningPlans` |
| Archive / complete plan | `archivePlanAction` / `completePlanAction` | `PlanIdSchema` | `learningPlans.status` |
| Toggle concept done | `toggleConceptAction` | `ConceptIdSchema` | `learningPlanConcepts.completedAt` |
| Add/remove concept | `addConceptAction` / `removeConceptAction` | `AddConceptSchema` / `ConceptIdSchema` | `learningPlanConcepts` |
| Log study session | `logStudySessionAction` | `LogStudySchema` | `studyLogs` |

## Panel — purchases

| Form | Page | Action | Schema | Effect |
|---|---|---|---|---|
| Pricing tier "Buy" button (`PricingSection`) | `/kierunki/[slug]` | `createCheckoutSession` | (reads `priceId`/`courseSlug`/`accessTier` directly, no `schema.ts` entry — Stripe's own API validates the price) | Redirects to Stripe Checkout; enrollment written later by the `stripe` webhook |

## Blog (public + admin)

| Form | Page | Action | Schema | Writes |
|---|---|---|---|---|
| `BlogLikeButton` | `/blog/[slug]` | `toggleBlogLikeAction` | `LikeBlogPostSchema` | `blogLikes` |
| (legacy) like/unlike | — | `likeBlogPostAction` / `unlikeBlogPostAction` | `LikeBlogPostSchema` / `UnlikeBlogPostSchema` | `blogLikes` |
| `BlogPostForm` create/edit | `/admin/posts/new`, `/admin/posts/[id]/edit` | `createBlogPostAction` / `updateBlogPostAction` | `CreateBlogPostSchema` / `UpdateBlogPostSchema` | `blogPosts` |
| Post delete | `/admin/posts` | `deleteBlogPostAction` (or `deleteBlogPost`) | `DeleteBlogPostSchema` | `blogPosts` |
| Publish / archive controls | `/admin/posts` | `publishBlogPostAction` / `archiveBlogPostAction` | `PublishBlogPostSchema` | `blogPosts.status` |
| `CategoryForm` create/edit | `/admin/categories/*` | `createBlogCategoryAction` / `updateBlogCategoryAction` | `CreateBlogCategorySchema` / `UpdateBlogCategorySchema` | `blogCategories` |
| Category delete | `/admin/categories` | `deleteBlogCategoryAction` | `DeleteBlogCategorySchema` | `blogCategories` |
| `TagForm` create/edit | `/admin/tags/*` | `createBlogTagAction` / `updateBlogTagAction` | `CreateBlogTagSchema` / `UpdateBlogTagSchema` | `blogTags` |
| Tag delete | `/admin/categories` (tags section) | `deleteBlogTagAction` | `DeleteBlogTagSchema` | `blogTags` |

## Forum

| Form | Page | Action | Schema | Writes |
|---|---|---|---|---|
| `CreatePostButton` modal | `/forum` | `createForumPostAction` | `CreatePostSchema` | `forumPosts` |
| Post delete (author-only) | `/forum/[postId]` | `deletePostAction` | — | `forumPosts` |
| `ForumDetailComments` add | `/forum/[postId]` | `createCommentAction` | `CreateCommentSchema` | `forumComments` |
| Comment delete | `/forum/[postId]` | `deleteCommentAction` | — | `forumComments` |
| `MarkForumSeen` (auto-fires, not user-submitted) | `/forum`, `/forum/[postId]`, `/admin/forum` | `markForumSeenAction` | `MarkForumSeenSchema` | `forumReadState` |
| Admin: mark message read | `/admin/messages` | `markMessageAsReadAction` | — | `customersMessages.isRead` |

## Admin — RAG

| Form | Action | Schema | Effect |
|---|---|---|---|
| `CreateStoreSection` | `createFileSearchStoreAction` | `CreateStoreSchema` | Creates Vertex corpus, `ragConfig` |
| `UploadDocsSection` | `uploadFilesAction` | — (file-type validated inline: `.md`/`.txt`/`.pdf`) | Ingests corpus documents |
| `TestQueryForm` | `testRagQueryAction` | `TestRagQuerySchema` | Probe query, no DB write |
| Store delete control | `deleteFileSearchStoreAction` | — | Tears down corpus + `ragConfig` |

## AI tutor chat

| Form | Action | Schema | Notes |
|---|---|---|---|
| Tutor chat input (`MobileAIFloat` / chat drawer) | `askRagQuestion` | `RagQuerySchema` | The main tutor entry point — see [`21-server-actions.md`](./21-server-actions.md) for the full orchestration it performs. |

---

## Non-`schema.ts` validated forms

A few actions validate against something other than a `z.object` in `schema.ts`:
- `updatePreferencesAction` — validates against `PREFERENCE_DEFS` (`@/constants/...`), an allow-list of preference keys/values rather than a Zod object, since the shape is a flat key-value map.
- `createCheckoutSession` — trusts `priceId` to be one Stripe already knows (an invalid price fails at the Stripe API call, not at a local schema).
- `submitTestAction` — uses `CreateAnswersSchema(allowedLengths)`, a schema **factory function** rather than a static schema, because the valid answer-array shape depends on how many questions were in that specific test session.
