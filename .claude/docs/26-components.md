# Components Catalog

[← Back to index](./README.md)

591 files across `src/components/`, one component per file (Golden Rule #1). This is a full inventory, organized by directory/domain. Where a component is already walked through in a page-flow doc, that's cross-referenced instead of repeated. Names generally self-describe their purpose (PascalCase, descriptive) — per-item notes are added only where the name alone is ambiguous or the component is central to a documented flow.

## Directory overview

| Directory | Files | Domain |
|---|---|---|
| `components/` (top level) | 265 | Everything not yet carved into a domain subfolder — see grouped listing below. |
| `admin/` | 15 | `/admin` moderation & content-management UI — see [`13-pages-admin.md`](./13-pages-admin.md). |
| `aiTests/` | 3 | AI test-generation preview UI. |
| `blog/` | 2 | Blog page decoration/promo. |
| `cells/` | 56 | The "board cell" widget system — every cell type (RAG chat, media, flashcard, mind map, note, test, plan) plus its UI chrome. |
| `diagnozy/` | 46 | The full diagnozy domain: browse, study, `wypelnij` (fill-in), `egzamin` (exam + 3D mannequin) — see [`12-pages-panel-learning.md`](./12-pages-panel-learning.md). |
| `editor/` | 9 | Lexical rich-text editor: nodes, plugins, config, speech-to-text. |
| `errors/` | 3 | Error boundary + custom error display. |
| `excalidraw/` | 6 | Excalidraw diagram canvas chrome. |
| `icons/` | 50 | Hand-rolled SVG icon components (not from an icon library, aside from `lucide-react` used elsewhere). |
| `kursy/` | 1 | `/panel/kursy` category card. |
| `memory/` | 1 | `PreferencesForm` — see [`11-pages-panel-core.md`](./11-pages-panel-core.md) → `/panel/ustawienia`. |
| `mindmap/` | 12 | Mind-map view, controls, node cards + its own `icons/` sub-subfolder. |
| `modal/` | 6 | A generic modal primitive kit (`BaseModal`, `ModalHeader`/`Body`/`Footer`) — distinct from the many domain-specific `*Modal.tsx` files at the top level. |
| `nav/` | 1 | `DrawerNavLink`. |
| `opiekunReader/` | 6 | `opiekun-medyczny` procedure reader — see [`12-pages-panel-learning.md`](./12-pages-panel-learning.md). |
| `path/` | 11 | `/kierunki/[slug]` rich-path landing-page pieces. |
| `planner/` | 34 | Learning planner: wizard (16 files), dashboard (6), settings (2), plus top-level planner components. |
| `pricing/` | 6 | Pricing/tier comparison UI. |
| `quizzes/` | 12 | AI-generated + order-steps challenge UI. |
| `rag/` | 5 | `/admin/rag` management UI — see [`13-pages-admin.md`](./13-pages-admin.md). |
| `reader/` | 2 | PDF viewer (client-wrapped for `react-pdf`). |
| `skeletons/` | 29 | Suspense fallback skeletons — Golden Rule #2 requires a real skeleton per async boundary, never `<div>Loading...</div>`. |
| `ui/` | 10 | The shared primitive kit — `Button`, `Input`, `Label`, `Select`, `Textarea`, `Card`, `DropdownSelect`, `LinkButton`, `FeatureCheck` (Golden Rule #8: use these instead of hand-rolled elements). |

---

## `ui/` — shared primitives (Golden Rule #8)

`Button.tsx`, `Card.tsx`, `DropdownSelect.tsx`, `DropdownSelectOptions.tsx`, `FeatureCheck.tsx`, `Input.tsx`, `Label.tsx`, `LinkButton.tsx`, `Select.tsx`, `Textarea.tsx` — the canonical form-control and visual-primitive set referenced throughout root `CLAUDE.md`. Any new form control or styled primitive belongs here, not inlined.

## `modal/` — generic modal kit

`BaseModal.tsx`, `ModalHeader.tsx`, `ModalBody.tsx`, `ModalFooter.tsx`, `ModalCancelButton.tsx`, `AIGenerationModal.tsx` — the shared modal shell that domain-specific modals (the many `*Modal.tsx` files below) compose with.

## `skeletons/` — Suspense fallbacks

One skeleton per async section, matched 1:1 to the section it covers (e.g. `UserAnalyticsSkeleton` ↔ `UserAnalytics`, `DiagnozyBrowserSkeleton` ↔ `DiagnozyBrowser`). Full list: `AdminBlogPanelSkeleton`, `AdminForumPostListSkeleton`, `AdminForumStatsSkeleton`, `CategoryDetailSkeleton`, `DiagnozaContentSkeleton`, `DiagnozyBrowserSkeleton`, `EgzaminAttemptsListSkeleton`, `EgzaminContentSkeleton`, `EnrolledCoursesListSkeleton`, `ExamCountdownSkeleton`, `MessageListSkeleton`, `NaukaCardGridSkeleton`, `NaukaCategoriesSkeleton`, `NoCoursesBannerSkeleton`, `NoteFlashcardsSkeleton`, `NotePageSkeleton`, `OrderStepsChallengeSkeleton`, `PielegniastwoProceduresListSkeleton`, `PinnedNotesFeatureSkeleton`, `PracticalExamRunnerSkeleton`, `StorageQuotaWidgetSkeleton`, `TestimonialsCarouselSkeleton`, `TestsCategoriesListSkeleton`, `TestsCategoryCardSkeleton`, `UserAnalyticsSkeleton`, `UserMottoSkeleton`, `UserProgressSkeleton`, `UsernameSkeleton`, `WypelnijRunnerSkeleton`.

## `icons/` — hand-rolled SVG icons (50 files)

Navigation/feature icons (`DashboardIcon`, `ForumIcon`, `BlogIcon`, `HomeIcon`, `LearnIcon`, `PlannerIcon`, `ProceduresIcon`, `DiagnozyIcon`, `CoursesLibraryIcon`, `CaregiverIcon`, `NurseIcon`), editor-toolbar icons (`BoldIcon`, `ItalicIcon`, `UnderlineIcon`, `StrikeIcon`, `HeadingOneIcon`/`ThreeIcon`/`FiveIcon`, `UndoIcon`/`RedoIcon`, `SaveIcon`, `SyncIcon`), social (`FacebookIcon`, `InstagramIcon`, `LinkedInIcon`), and generic UI glyphs (`Close`, `MenuIcon`, `SearchIcon`, `DeleteIcon`, `ArrowUpIcon`/`DownIcon`, `LoadingIcon`, `SelectedIcon`, `MicrophoneIcon`, `AccessibilityIcon`, `CommunityIcon`, `InnovationIcon`, `ProgressIcon`, `Game`, `SwitchLeftIcon`/`RightIcon`, `LoginIcon`, `UserProfileIcon`, `LightModeIcon`/`DarkModeIcon`, `AddCommentIcon`, `AddPostIcon`, `FeadbackIcon` [sic], `XIcon`, `BookIcon`).

---

## `admin/` — see [`13-pages-admin.md`](./13-pages-admin.md)

`AdminForumPostList`/`AdminForumPostRow`/`AdminForumStats`/`AdminRecentForumPosts` (forum moderation), `AdminNav`/`AdminNavBadged` (nav shell), `AdminStatCard`/`AdminStatsGrid` (dashboard tiles), `BlogPostForm`/`CategoryForm`/`TagForm` (the create/edit-via-`mode`-prop forms), `DeletePostButton`/`DeletePostModal`, `PostsManagementContent`, `PptxImportPanel`.

## `cells/` — the board-cell widget system (56 files)

The "cell" is the app's generic board-widget abstraction (`userCellsList` in the DB, `Cell`/`CellTypes` in [`23-types.md`](./23-types.md)); every cell type gets its own subtree of components here:

- **Shared chrome**: `AddCell`, `CellContent`, `CellList`, `CellListItem`, `ActionBar`, `ActionButton`, `AIAutocompleteDropdowns`, `SaveCellsButton`, `SyncCellsButton`, `index.tsx`.
- **RAG chat cell**: `RagCell`, `RagCellForm`, `RagConversation`, `RagLoadingState`, `RagProgressIndicator`, `RagResponse`, `RagUserMessage`, `SourceChip`, `CommandAutocomplete`, `CommandBar`, `CommandChips`, `ResourceAutocomplete`.
- **Media cell**: `MediaCell`, `MediaCellPlayer`, `MediaHeader`, `AudioPlayer`, `AudioScreen`, `VideoPlayer`, `AlbumArt`, `PlayerControls`, `ProgressBar`, `VolumeSlider`, `Waveform`, `BumpedSeekBar`.
- **Flashcard cell**: `FlashcardCell`, `FlashcardCellCreateDeck`, `FlashcardCellEmpty`, `FlashcardCellPreview`, `FlashcardAddForm`, `FlashcardEditForm`, `FlashcardDeleteButton`, `FlashcardRow`.
- **Mind map cell**: `MindMapCell`, `MindMapGenerateForm`, `MindMapGenerationModal`.
- **Note cell**: `NoteCell`.
- **Plan cell**: `PlanCell`, `PlanCellPreview`, `PlanFooter`, `PlanHeader`, `PlanPrerequisites`, `PlanStepItem`.
- **Test cell**: `TestCell`, `TestCellPreview`, `TestQuestionEditor`, `SaveTestForm`.

## `diagnozy/` — see [`12-pages-panel-learning.md`](./12-pages-panel-learning.md) (46 files)

- **Top level**: `DiagnozaCard`, `DiagnozaHeader`, `DiagnozaStudyView`, `DiagnozaTabs`, `DiagnozyChapterGroup`, `InterwencjeTable`, `StringListOrGrouped`, `StudySection`.
- **`browse/`**: `DiagnozyBrowser`, `DiagnozyEmptyState`, `DiagnozyHeader`, `DiagnozyResults`, `DiagnozyToolbar`.
- **`egzamin/`**: `BodyZonePicker`, `EgzaminAttemptsList`/`Panel`/`Stats`/`Toolbar`, `EgzaminHeader`, `EgzaminNav`, `EgzaminResult`/`ResultStep`, `EgzaminRunner`, `EgzaminScoreCard`, `EgzaminStart`, `EgzaminStep`, `EgzaminTimer`, `WykonanieActiveCaption`, `WykonanieInterwencjeList`, `WykonanieMannequinPanel`, `WykonanieNumberRail`, `WykonanieProgress`, `WykonanieSidePanel`, `WykonanieStep`, and its own **`egzamin/mannequin/`** sub-subfolder (`MannequinBody`, `MannequinCameraRig`, `MannequinScene`, `MannequinStageLighting`, `MannequinViewControls`) for the 3D anatomy picker used in the practical exam.
- **`wypelnij/`**: `AddFromListRow`, `PrzewodnikFormRow`, `SingleSelectRow`, `WypelnijCasePanel`, `WypelnijComplete`, `WypelnijGuide`, `WypelnijRunner`.

## `editor/` — Lexical rich text

`Editor.tsx`, `EditorToolbar.tsx`, `editorConfig.ts`, `viewerConfig.ts` (separate read-only config), `nodes/CommentNode.ts`, `nodes/HighlightNode.ts` (custom Lexical node types for inline comments and highlights — the study-mode annotation feature), `plugins/CommentPlugin.tsx`, `plugins/HighlightPlugin.tsx`, `speech/SpeechToTextButton.tsx` (pairs with `useSpeechRecognition`, see [`22-hooks.md`](./22-hooks.md)).

## `errors/`

`ErrorBoundary.tsx`, `CustomError.tsx`, `index.ts`.

## `excalidraw/` — diagram canvas chrome

`Excalidraw.tsx` (wrapper), `ExcalidrawMenu.tsx`, `DiagramControls.tsx`, `DiagramIconButton.tsx`, `DiagramConvertingState.tsx` (loading state while Mermaid→Excalidraw conversion runs), `DiagramErrorState.tsx`.

## `mindmap/`

`MindMapView.tsx`, `MindMapControls.tsx`, `MindMapLegend.tsx`, `MindMapNode.tsx`, `MasteryToolbar.tsx` (mastery-level filter, ties to `MasteryLevel` in `mindmapTypes.ts`), `NodeDetailCard.tsx`, `NodeExplanationPanel.tsx`, `NodeMasteryPicker.tsx`, plus its own `icons/` subfolder (`IconBase.tsx`, `categoryIcons.tsx`, `uiIcons.tsx`, `index.ts`) — mind-map-specific icon set, separate from the top-level `components/icons/`.

## `opiekunReader/` — see [`12-pages-panel-learning.md`](./12-pages-panel-learning.md)

`OpiekunProcedureReader.tsx`, `OpiekunReaderMobileHeader.tsx`, `OpiekunReaderSidebar.tsx`, `OpiekunSectionContent.tsx`, `OpiekunStepRow.tsx`, `ReaderFooterNav.tsx`.

## `path/` — `/kierunki/[slug]` rich landing page

`PathHero.tsx`, `PathTools.tsx`, `PathFacts.tsx`, `PathStepCard.tsx`, `PathStoryHero.tsx`, `PathTimeline.tsx`, `StorySceneCard.tsx`, `StorySceneTrack.tsx`, `ToolListItem.tsx`, `SectionDivider.tsx`, `CourseCheckoutButton.tsx` (the pricing-tier buy button, submits `createCheckoutSession` — see [`10-pages-public.md`](./10-pages-public.md)).

## `planner/` — see [`11-pages-panel-core.md`](./11-pages-panel-core.md) (34 files)

- **Top level**: `ConceptList.tsx`, `PlanDashboard.tsx`, `PlanSettings.tsx`, `PlanWizard.tsx`, `QuickStudyLogForm.tsx`, `StatTile.tsx`.
- **`dashboard/`**: `AddConceptForm`, `ConceptRow`, `PlanDashboardHeader`, `PlanProgressBar`, `PlanStatTiles`, `TodayFocusCard`.
- **`settings/`**: `PlanLifecycleActions` (archive/complete controls), `PlanSettingsForm`.
- **`wizard/`**: `CapacitySummary`, `CatalogEntry`, `ConceptTopicRow`, `CourseSelector`, `CustomConceptInput`, `ExamPresetList`, `ExamTemplateFill`, `FocusProgram`, `FocusSubjectPicker`, `FocusTopicGroup`, `GoalTypeSelector`, `ProcedurePicker`, `SelectedConceptsList`, `StepGoal`, `StepScope`, `StepTime`, `WeekdayPicker`, `WizardFieldLabel`, `WizardNav`, `WizardStepIndicator` — the full multi-step plan-creation wizard, one component per step/concern.

## `pricing/`

`PricingSection.tsx` (the top-level orchestrator used on `/kierunki/[slug]`), `PricingCardsGrid.tsx`, `CourseSubjectList.tsx`, `PlanComparisonCards.tsx`, `PlanComparisonTable.tsx`, `SectionHeading.tsx`.

## `quizzes/`

`ChallengesHub.tsx` (see [`12-pages-panel-learning.md`](./12-pages-panel-learning.md)), `ChallengeTypeCard.tsx`, `GeneratedQuizExperience.tsx`, `HubProgressHeader.tsx`, `QuizGeneratingState.tsx`, `QuizIntroCard.tsx`, `QuizOptionRow.tsx`, `QuizResultView.tsx`, `QuizReviewRow.tsx`, `KnowledgeQuizPlayer.tsx`, `ScenarioPlayer.tsx`, `SpotErrorPlayer.tsx` (the three AI-generated challenge-type players, matching `GeneratedKnowledgeQuiz`/`GeneratedScenarioQuiz`/`GeneratedSpotErrorQuiz` in [`23-types.md`](./23-types.md)).

## `rag/` — see [`13-pages-admin.md`](./13-pages-admin.md)

`CreateStoreSection.tsx`, `UploadDocsSection.tsx`, `DocumentListTable.tsx`, `StoreStatusCard.tsx`, `TestQueryForm.tsx`.

## `reader/`

`PDFViewer.tsx` + `PDFViewerClient.tsx` (client/server split — `react-pdf` needs a client boundary).

## `aiTests/`, `blog/`, `kursy/`, `memory/`, `nav/` (small, single-purpose folders)

`aiTests/`: `AIQuestionPreviewCard`, `AITestGenerateForm`, `AITestGenerator`. `blog/`: `BlogBackground`, `BlogPromoBanner`. `kursy/`: `CategoryCard`. `memory/`: `PreferencesForm`. `nav/`: `DrawerNavLink`.

---

## Top-level `components/` (265 files) — grouped by domain

Not yet carved into subfolders; grouped here by naming/functional cluster for navigability.

**Tests & test-taking**: `AllTests`, `GenerateTests`, `TestCard`, `TestTimer`, `TestResultCard`, `TestsCategoriesList`, `TestsCategoryCard`, `TestsLevelMenu`, `StartTestForm`, `ChooseAnswerCount`, `CategoryTestButton`, `CategoryToggleButton`, `CategoryActionBar`, `RandomTestButton`, `ResetTestButton`, `Answers`, `FilteredTestsList`, `CompletedTestCard`, `CompletedTestDeleteButton`, `CompletedTestDeleteModal`, `CompletedTestsList`, `CountdownTimer`, `ConfirmLeaveModal`, `QuestionTitlePreview`, `QuestionsPanel`, `TestyEgzaminyHub`.

**Custom test authoring** (`/panel/dodaj-test`): `CreateTab`, `CreateTestForm`, `CreateTestHeader`, `CreateTestTabs`, `ManualTestBuilder`, `ManageTab`, `UploadTestForm`, `CustomTestCard`, `CustomTestOptions`, `CustomTestsList`, `CustomCategoriesTab`, `CustomCategoryManager`, `CategoryCreationForm`, `CategoryManagerHeader`, `EditableCategoryName`, `CategoryDeleteButton`, `CategoryDeleteModal`, `CategoryDeleteModalWrapper`, `DeleteCategoryModal`, `DeleteTestModal`, `DefaultTestOptions`, `LinkedSubjectSelect`, `QuestionSelectionStore`-adjacent `CategorySelection`.

**Categories (browsing/detail)**: `CategoriesPanel`, `CategoryBenefit`, `CategoryCard`, `CategoryCTA`, `CategoryDeepLinkScroller`, `CategoryDetailView`, `CategoryGrid`, `CategoryHeader`, `CategoryPerformanceTable`.

**Practical & diagnozy exams**: `PracticalExamCard`, `PracticalExamList`, `PracticalExamRunner`, `GeneratePracticalExamModal`, `ExamArkuszBrief`, `ExamCaseSidebar`, `ExamCountdown`, `ExamFormCard`, `ExamResults`, `ExamSectionHeader`, `ExamStatTile`.

**Procedures & challenges**: `AllProcedures`, `ProceduresHub`, `ProceduresList`, `PielegniastwoGridCard`, `PielegniastwoProcedureReader`, `PielegniastwoProceduresList`, `GridProcedureCard`, `ChallengeButton`, `ChallengeMenu`, `OrderStepsChallenge`, `OrderableSteps`, `SortableItem` (drag-and-drop primitive, `@dnd-kit`).

**Notes & study materials**: `CreateNoteForm`, `EditNoteModal`, `NoteContentViewer`, `NoteDeleteButton`, `NoteDeleteModal`, `NoteFlashcardsPanel`, `NoteFlashcardsSection`, `NoteMetaFields`, `NoteMetadataCard`, `NoteNotFound`, `NotePageContent`, `NotePreviewCard`, `NotesSection`, `PinnedNoteCard`, `PinnedNotePreview`, `PinnedNotesFeature`, `PinnedNotesSection`, `PinButton`, `PinnedCheckbox`, `StudyToolbar`, `StudyViewer`, `StudyViewerContent`, `SelectionTooltip`, `RichTextContent`, `CommentModal`, `TagSelector`.

**Materials & uploads**: `MaterialCard`, `MaterialDeleteButton`, `MaterialDeleteModal`, `MaterialsSection`, `UploadMaterialForm`, `UploadMaterialModal`, `UploadSVG`, `StorageQuotaWidget`, `StorageUsage`.

**Flashcards**: `FlashcardCreateModal`, `FlashcardDeckCard`, `FlashcardReviewModal`, `FlashcardReviewModalHost`, `FlashcardsSection`.

**Nauka hub**: `NaukaCategoriesSection`, `NaukaCellsSection`, `NaukaFlashcardsSection`, `NaukaLecturesSection`, `NaukaMaterialsSection`, `NaukaNotesSection`, `LearningHubHeader`, `LearningCard`, `LearningCategoryCard`, `LearningOutcomesSection`, `LearningPaginationButton`, `LearningPaginationControls`, `LectureCard`, `LecturesSection`.

**Blog**: `AllPosts`, `BlogHero`, `BlogSearch`, `BlogSort`.

**Forum**: `AddCommentButton`, `CreateCommentForm`, `CreatePostButton`, `CreatePostForm`, `DeleteCommentButton`, `DeletePostButton`, `ForumActivityCard`, `ForumDetailComments`, `ForumDetailContent`, `ForumDetailHeader`, `ForumNotificationBadges`, `ForumPostActions`, `ForumPostCard`, `ForumPostComments`, `ForumPostHeader`, `ForumPostList`, `ForumPosts`, `ForumPostsSkeleton`, `ForumSearch`, `ForumSort`, `MarkForumSeen`.

**User profile & dashboard**: `AdminBlogWidget`, `BadgeWidget`, `BadgeWidgetSkeleton`, `DashboardInfo`, `MottoForm`, `OnboardingChecklist`, `UserAnalytics`, `UserAnalyticsClient`, `UserMotto`, `UserOnboard`, `UserProgress`, `Username`, `UsernameForm`, `TestimonialForm`, `TestimonialsCarousel`, `AnalyticsDetailed`, `AnalyticsOverview`, `AnalyticsPlanTab`, `ProgressLineChart`, `QuestionAccuracyList`, `ProblematicQuestionCard`, `CircularProgressBar`, `LinearProgressBar`, `StatsRow`.

**Courses & enrollment**: `EnrolledCoursesList`, `CourseAccessWidget`, `CourseInfoSection`, `CoursePricingCard`, `CurriculumMap`, `ProgramContentSection`, `ProgramTopicItem`, `NoAccessMessage`, `NoCoursesBanner`, `TierUpgradeMessage`, `PremiumLock`, `KieurnkiPageContent` [sic — filename typo for "Kierunki"].

**Messages & settings**: `MessageManagement`, `MobileAIFloat`, `SettingsModal`, `SettingsToggle`, `SideAIInput`.

**Marketing / landing page decoration**: `AboutBento`, `EducationalPathCard`, `PathCarousel`, `SimplePathCard`, `FeatureCard`, `HeroButton`, `HeroCallToActionButtons`, `HeroEntityField`, `HeroSpotlightCard`, `HeroTitle`, `FadeInSection`, `SectionHalo`, `GradientOverlay`, `FloatingShapes`, `FloatingInstagram`, `FooterInstagram`, `FounderTile`, `CustomMemberCard`, `TriangleDivider`, `WigglyWord`, `AnimatedChar`, `Title`, `TitleButton`, `Stars`, `Shape`.

**Decorative SVGs**: `AggressiveVirusSVG`, `BacteriaSVG`, `HumanCellSVG`, `PathogenBacteriaSVG`, `VirusSVG`.

**Generic UI**: `AuthButton`, `AuthSection`, `BackToNotesLink`, `Checkbox`, `CustomButton`, `CustomRadioInput`, `DrawerHandle`, `EditorField`, `ExploreLink`, `FieldError`, `HomeButton`, `LoadingSpinner`, `Logo`, `NavDrawer`, `PaginationButton`, `PaginationControls`, `Resizable`, `BottomResizableHandle`, `RightResizableHandle`, `SearchTerm`, `SortSelect`, `SubmitButton`, `TabNavigation`, `TermsHeader`, `TopCustomButton`, `TopPanel`, `TopicActionButton`, `Tooltip`, `PdfPreviewModal`, `TextPreviewModal`, `QuestionnaireForm`.

**Admin dashboard widget**: `AdminBlogPanel`.

---

**Audit note**: `KieurnkiPageContent.tsx` (top level) has a typo in "Kierunki" — cosmetic, not fixed here since it's a working filename referenced by an import elsewhere, and renaming it is a code change outside a documentation pass. `admin/DeletePostButton.tsx` / `admin/DeletePostModal.tsx` share names with top-level `DeletePostButton.tsx` — different components (admin blog-post deletion vs. forum-post deletion) but worth knowing when searching by name alone.
