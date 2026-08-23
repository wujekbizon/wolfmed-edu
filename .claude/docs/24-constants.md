# Constants Catalog

[← Back to index](./README.md)

All 65 files in `src/constants/`. Grouped by domain; each entry lists the file's exports and a one-line purpose.

## Access & premium

| File | Exports | Purpose |
|---|---|---|
| `access.ts` | `PREMIUM_STALE_TIME`, `premiumAccessKey` | React Query cache key/staleTime for premium-access checks. |

## Forms & UI primitives

| File | Exports | Purpose |
|---|---|---|
| `formState.ts` | `EMPTY_FORM_STATE` | The initial value passed to every `useActionState` call app-wide — see [`20-forms-catalog.md`](./20-forms-catalog.md). |
| `buttonStyles.ts` | `ButtonVariant` (`primary`/`secondary`/`accent`/`ghost`/`cta`), `ButtonSize` (`sm`/`md`/`lg`/`submit`), `ButtonShape` (`soft`/`rounded`/`pill`), `BUTTON_BASE`, `BUTTON_VARIANTS`, `BUTTON_SIZES`, `BUTTON_SHAPES` | Shared button style tokens backing `ui/Button.tsx`, `ui/LinkButton.tsx`, and `SubmitButton.tsx` (Golden Rule #8) — one style system for all three so a variant/size/shape added here is available to buttons, links styled as buttons, and form submit buttons alike. |
| `optionsLetters.ts` | `LETTERS` | A/B/C/D-style option labeling for quiz/test choices. |
| `uiTypes` companion `uiTypes.ts` is in `types/`, not here — see [`23-types.md`](./23-types.md). |

## Tests, categories, quizzes

| File | Exports | Purpose |
|---|---|---|
| `aiTests.ts` | `QUESTION_COUNT_OPTIONS` | Selectable question counts for AI test generation. |
| `categoryMetadata.ts` | `DEFAULT_CATEGORY_METADATA`, `CATEGORY_METADATA` | Per-category SEO/display metadata — the map driving `generateMetadata` across `/panel/testy`, `/panel/nauka/[category]`, `/panel/kursy/[categoryId]`. |
| `categoryOptions.ts` | (data, no named type export matched) | Category option list for pickers. |
| `tagCountOptions.ts` | `TAG_COUNT_OPTIONS` | Selectable counts for tag-related UI. |
| `questionnaireOptions.ts` | `questionnaireOptions` | Options for a questionnaire-style form — confirmed tied to `enums.ts`'s `SelectedOptions1`–`5` (imports them directly to build each question's option list). |

## Blog & forum

| File | Exports | Purpose |
|---|---|---|
| `blog.ts` | `DEFAULT_BLOG_IMAGE` | Fallback cover image for posts without one. |
| `blogMarkdown.ts` | `EMOJI_MAP` | Emoji-shortcode-to-character map for blog markdown rendering. |
| `forumNotifications.ts` | `FORUM_NOTIFICATIONS_EPOCH`, `FORUM_NOTIFICATION_BADGE_CAP`, `ADMIN_FORUM_PAGE_SIZE` | Unread-badge cutoff/cap and the admin forum list's page size (see [`13-pages-admin.md`](./13-pages-admin.md)). |
| `forumSort.tsx` | `sortOptions` | Forum list sort dropdown options. |

## Diagnozy & practical exams

| File | Exports | Purpose |
|---|---|---|
| `diagnozyBrowse.ts` | `DIAGNOZY_SORT_LABELS`, `DIAGNOZY_STATUS_LABELS`, `DIAGNOZY_ALL_CHAPTERS_LABEL` | Browse/filter UI labels for `DiagnozyBrowser`. |
| `diagnozyEgzamin.ts` | `EXAM_DURATION_MINUTES`, `WYKONANIE_INDEX`, `EMPTY_ANSWERS` | Diagnozy exam timing + initial answer state. |
| `examAttempts.ts` | `ATTEMPTS_PREVIEW_COUNT`, `EXAM_ATTEMPT_SORT_LABELS`, `EXAM_ATTEMPT_STATUS_LABELS`, `ATTEMPTS_HISTORY_LIMIT` | Diagnozy exam-attempts history display config — see [`12-pages-panel-learning.md`](./12-pages-panel-learning.md). |
| `examDates.ts` | `EXAM_PERIODS` | Exam period/session date definitions. |
| `practicalExamCards.ts` | `PracticalExamCardMetadata`, `DEFAULT_PRACTICAL_EXAM_METADATA`, `PracticalExamAICardMetadata`, `PRACTICAL_EXAM_AI_CARD` | Card display metadata for `/panel/egzaminy`'s exam list, including the AI-generated-exam card variant. |

## Planner

| File | Exports | Purpose |
|---|---|---|
| `planner.ts` | `WEEKDAYS`, `PACE_CONFIG`, `PLAN_INPUT_CLASS`, `MAX_CONCEPTS`, `TOPIC_DEFAULT_MINUTES`, `CONCEPT_DEFAULT_MINUTES`, `PROCEDURE_DEFAULT_MINUTES`, `MIN_MINUTES_PER_DAY`, `MAX_MINUTES_PER_DAY` | Learning-plan wizard defaults/limits. |
| `planComparison.ts` | `PLAN_COMPARISON` | Pricing/plan comparison table data (marketing, not the learning planner — naming overlap to note). |

## Flashcards, cells, media

| File | Exports | Purpose |
|---|---|---|
| `flashcards.ts` | `FLASHCARD_STALE_TIME`, `flashcardDecksKey`, `flashcardDeckKey`, `flashcardNoteDeckKey`, `FLASHCARD_FILTERS` | React Query keys/staleTime + filter options for flashcard data (Golden Rule #5). |
| `cellButtons.ts` | `cellButtons` | Board "add cell" toolbar button definitions. |
| `mediaPlayer.ts` | `SPEED_OPTIONS`, `SpeedOption` | Playback-speed options for the audio/video player hooks. |
| `timeSegments.ts` | `TIME_SEGMENTS` | `[{key: 'days', label: 'Dni'}, 'hours', 'minutes', 'seconds']` — confirmed its only consumer is `CountdownTimer.tsx`, a generic countdown display, not planner-specific as an earlier pass of this doc guessed. |

## Mind maps & diagrams

| File | Exports | Purpose |
|---|---|---|
| `mindmapCanvas.ts` | `FIT_VIEW_OPTIONS` | `@xyflow/react` fit-view config for the mind-map canvas. |
| `diagramCanvas.ts` | `SCENE_FOCUS`, `MIN_FIT_ZOOM`/`MAX_FIT_ZOOM`, `FIT_PADDING`, `RESIZE_DEBOUNCE_MS`, `SAVE_DEBOUNCE_MS`, `GROUP_PADDING`, `GROUP_SEPARATION`, … | Excalidraw diagram canvas layout/persistence tuning constants. |
| `diagramChrome.ts` | `DIAGRAM_SURFACE`, `DiagramTheme` | Diagram canvas visual theme tokens. |
| `diagramRoles.ts` | `DIAGRAM_ROLES`, `DiagramRole`, `DIAGRAM_GROUP_ROLE`, `DIAGRAM_ROLE_LABELS`, `DIAGRAM_ROLE_COLORS`, `DIAGRAM_CLASSDEFS`, `DIAGRAM_DETAIL_LEVELS`, `DiagramDetail`, `DEFAULT_DIAGRAM_DETAIL`, `DIAGRAM_BUDGET_OVERRUN_FACTOR` | Semantic node-role taxonomy + colors for generated diagrams, and the detail-level/budget system controlling how much a generated diagram tries to show. |
| `mermaidSyntax.ts` | `MERMAID_ID`, `MERMAID_ID_LIST` | Mermaid diagram ID validation/parsing constants. |

## Mannequin / anatomy viewer

| File | Exports | Purpose |
|---|---|---|
| `mannequinViews.ts` | `DEFAULT_VIEW_DISTANCE`, `MIN_VIEW_DISTANCE`, `MAX_VIEW_DISTANCE`, `VIEW_DISTANCE_STEP`, `MANNEQUIN_VIEWS`, `MANNEQUIN_VIEW_KEYS` | Camera distance limits and named views for the 3D mannequin (`@react-three/fiber`) used in procedure visual-recognition challenges. |

## AI tutor / RAG / memory / embeddings

| File | Exports | Purpose |
|---|---|---|
| `rag.ts` | `RAG_TOP_K` (= 12), `RAG_TOP_K_BROAD` (= 20, used by mind-map generation — it summarizes a whole topic rather than one question, so it casts a wider net), `RAG_VECTOR_DISTANCE_THRESHOLD` (= 0.5), `CORPUS_MISS_DISTANCE` (= 0.34) | The retrieval tuning knobs documented in [`00-architecture.md`](./00-architecture.md) — every corpus-reading feature imports these rather than inlining a number. |
| `embeddings.ts` | `EMBED_DIM`, `EMBEDDING_MODEL`, `EMBED_TIMEOUT_MS`, `EMBED_BACKGROUND_TIMEOUT_MS`, `EMBED_MAX_RETRIES`, `EMBED_RETRY_BASE_MS`, `EMBED_PACE_MS`, `EMBED_BATCH_SIZE` | Embedding model + retry/pacing config shared by the personal library (`libChunks`) and memory (`memFacts`/`memEpisodes`) vector columns — see [`01-database-schema.md`](./01-database-schema.md). |
| `memoryPolicies.ts` | `PolicyType`, `DefaultPolicy`, `DEFAULT_POLICIES` | Seed data for the `memPolicies` table. |
| `memoryPreferences.ts` | `PreferenceOption`, `PreferenceDef`, `PREFERENCE_DEFS`, `PREFERENCE_KEYS`, `preferenceValueLabel`, `preferenceLabel` | The allow-list `updatePreferencesAction` validates against (see [`21-server-actions.md`](./21-server-actions.md)) — drives `PreferencesForm` on `/panel/ustawienia`. |
| `memoryMessages.ts` | `EMPTY_SELF_STATE_MESSAGE`, `UNAVAILABLE_SELF_STATE_MESSAGE`, `AMBIGUOUS_TUTOR_INTENT_MESSAGE` | Fixed user-facing outcomes when typed memory is empty/unavailable or semantic intent needs clarification; none asks a contextual follow-up or falls through to curriculum RAG. |
| `commands.ts` | `COMMANDS` | The autocomplete-facing command list — **derived** from `toolCommands.ts`'s `TOOL_COMMAND_LIST` via `.map()`, not hand-maintained separately. The source has an explicit comment: this derivation exists because the two lists had previously drifted (5 vs. 7 entries) when maintained by hand. |
| `toolCommands.ts` | `TOOL_COMMANDS`, `TOOL_COMMAND_NAMES`, `TOOL_COMMAND_LIST`, `PALETTE_COMMANDS` | The `/commands` catalog referenced in root `CLAUDE.md`'s `requiresSource` rule — each command's source requirement lives here. |
| `progress.ts` | `STAGE_PROGRESS`, `STAGE_MESSAGES`, `TOOL_LABELS`, `TOOL_LABELS_ACCUSATIVE`, `TOOL_LABELS_GENITIVE`, `PROGRESS_DELAY`, `JOB_TTL`, `KEEP_ALIVE_INTERVAL`, `DEFAULT_SSE_RETRY`, `JOB_WAIT_TIMEOUT`, `SSE_POLL_INTERVAL` | Everything driving the `/api/rag/progress` SSE job-progress UI (see [`14-api-routes.md`](./14-api-routes.md)) — including Polish grammatical-case label variants (`_ACCUSATIVE`/`_GENITIVE`) for natural-language progress messages. |
| `ragCell.ts` | `RAG_MAX_MESSAGES` | Cap on messages kept in a RAG chat cell's history. |

## Uploads & study viewer

| File | Exports | Purpose |
|---|---|---|
| `uploadthing.ts` | `UPLOAD_SIZE_LIMITS`, `SupportedFileType`, `FILE_TYPE_NAMES` | Upload constraints shared between the client dropzone and `ourFileRouter`. |
| `studyViewer.ts` | `HIGHLIGHT_COLORS`, `STUDY_TOOLBAR_TEXT`, `COMMENT_MODAL_TEXT`, `FLASHCARD_MODAL_TEXT`, `SELECTION_TOOLTIP_TEXT`, `FLASHCARD_REVIEW_TEXT` | Text-selection study-mode UI copy/colors (procedure/note reading view). |

## Marketing / landing page / navigation

| File | Exports | Purpose |
|---|---|---|
| `careerPath.ts` | `OPIEKUN_MEDYCZNY_PATH: CareerPath` | The `opiekun-medyczny` career-timeline content (`PathTimeline`/`PathStepCard`) — headline + ordered `steps` (title, duration, description, photo). One named export per path, not a generic single constant. |
| `careerPathsData.ts` | `careerPaths`, `curriculum`, `careerPathsData` | The full `/kierunki/[slug]` content source, keyed by slug — assembles `careerStory.ts`/`careerPath.ts`/`careerQuestions.ts` per path into `PathData` (see [`23-types.md`](./23-types.md)). See [`10-pages-public.md`](./10-pages-public.md). |
| `careerQuestions.ts` | `PIELEGNIARSTWO_QUESTIONS: PathQuestions` | The Q&A + photo-shot content for `PathQuestionsHero` (the `pielegniarstwo` landing page's questions-first variant, used instead of `PathStoryHero`/`PathTimeline` when `careerPathsData[slug].questions` is set). |
| `careerStory.ts` | `OPIEKUN_MEDYCZNY_STORY: PathStory` | Narrative marketing content for `PathStoryHero`/`StorySceneTrack` (intro, `facts`, scrollytelling `scenes`) — one named export per path, not a generic single constant. |
| `courseProcedureCards.ts` | `CourseProcedureCard`, `COURSE_PROCEDURE_CARDS` | Landing/marketing cards showcasing procedures per course. |
| `curriculumAnchor.ts` | `CURRICULUM_ANCHOR` | Scroll-anchor id (`'program'`) for jumping to the curriculum-map section from `PathQuestionsHero`'s CTA link. |
| `pathShotHeights.ts` | `PATH_SHOT_HEIGHTS` | Cycling list of Tailwind height classes so `PathShotCollage`'s photo frames read as an uneven collage rather than a uniform grid. |
| `pathTools.ts` | `PATH_TOOLS_INTRO` | Intro copy for `PathTools` (feature list on a course landing page). |
| `planComparisonPanel.ts` | `PLAN_COMPARISON_PANEL_ID` | Shared DOM id string wiring `PlanComparisonToggle`'s `aria-controls` to `PlanComparisonPanel`'s `id` (see [`26-components.md`](./26-components.md) → `pricing/`). |
| `pricingAnchor.ts` | `PRICING_ANCHOR` | Scroll-anchor id/config for jumping to the pricing section. |
| `procedureSlugs.ts` | `PROCEDURE_SLUG_TO_ID`, `PROCEDURE_ID_TO_SLUG`, `getProcedureIdFromSlug`, `getProcedureSlugFromId` | Bidirectional slug↔id lookup for procedures (stable public URLs vs. internal ids). |
| `educationalPathCards.tsx` | `CardProps`, `CAREGIVER`, `NURSE`, `INFO` | The three home-page education-path cards (see [`10-pages-public.md`](./10-pages-public.md)). |
| `aboutCards.tsx` | `cards` | Home page "About" section cards. |
| `teamMembers.tsx` → `teamMembers.ts` | `teamMembers` | Team/about page member list. |
| `testsMenu.ts` | `testsMenu` | Test-category menu structure. |
| `challenges.tsx` | `challenges` | Marketing-facing challenge showcase list (distinct from the runtime `ChallengeType` in `types/challengeTypes.ts`). |
| `navLinks.tsx` | `navLinks` | Main navbar links (see [`10-pages-public.md`](./10-pages-public.md) → Navbar). |
| `sideMenuLinks.tsx` | `sideMenuNavigationLinks` | `/panel` sidebar navigation. |
| `dashboardLinks.tsx` | `dashboardLinks` | Dashboard quick-link tiles. |
| `topPanelFeatures.tsx` | `topPanelFeatures` | Feature highlight tiles somewhere in the panel top area. |
| `adminNavLinks.ts` | `ADMIN_NAV_LINKS` | `/admin` nav structure (see `AdminNav`/`AdminNavBadged`, [`13-pages-admin.md`](./13-pages-admin.md)). |
| `cookieCategories.ts` | `CookieCategory`, `CookieInfo`, `CookieCategoryInfo`, `cookieCategories` | Cookie-consent banner category definitions. |
| `googleAnalytics.tsx` | `GA_ID`, `GTAG_JS_URI`, `GTM_JS_URI` | Analytics script config. |
| `instagram.tsx` | `INSTAGRAM_URL`, `FOOTER_INSTAGRAM_ID`, `instagramHighlights` | Social link + `FloatingInstagram` content. |
| `editorToolbar.tsx` | `TOOLBAR_BUTTONS` | Lexical editor toolbar button definitions (pairs with `useEditorToolbar`, see [`22-hooks.md`](./22-hooks.md)). |
