# Wolfek learning help — October 4

Premium-only companion on category learning pages, enforced in UI and server authorization. Basic card checking/reveal stays available independently.

First prepared click evaluates the route's hint, comparison, discussion and reveal-confirmation prompts in one Jev batch. Its decisions select RAG modes, not medical text. Only the clicked mode retrieves curriculum through `retrieveContext(canonical_only)` and uses the existing grounded Gemini generator. Typed follow-ups call Jev afresh and carry bounded conversation history. No generation runs on mount or for unused batch answers. Changes to card, selection or session facts invalidate reuse.

Hint: at most two short sentences, no solution letter, direct answer quotation or correctness verdict. Comparison: up to three short points explaining the student's current selected option against the alternatives without choosing the correct one. The browser passes the currently selected index even before checking; the server validates its range against the actual card. These modes exclude stored answer keys and previous full explanations from generator context.

Full discussion requires the key already visible. Otherwise the user confirms `Pokaż i wyjaśnij`; reveal is committed on the server, then explanation runs automatically. There is no second tutor form or `Zapytaj` step. A provider failure after reveal still returns the updated session so the UI reflects the committed reveal.

Empty retrieval gives an explicit no-source message and skips generation. The generator also receives an exact no-source response for inadequate retrieved evidence. Output budgets and short-mode instructions limit verbosity. Medical quality and indirect solution leakage still require manual evaluation; excluding the stored key alone is not a semantic guarantee.

Grounded hint/comparison use is recorded transactionally before delivery, setting assisted exposure for unresolved cards. After-answer assistance preserves previous grading. Full explanation records tutor usage; reviewed content and session changes are checked again after inference. Network submission coordination prevents duplicate inference attempts and replay validates current access/card state. Jev audit delivery records include generated text; original provider responses remain unchanged.

All output appears in the shared animated Wolfek speech bubble. Sources are collapsed, confirmation buttons wrap, and the overlay has one primary scroll container. The explicitly expanded extra-question list retains its separate bounded scroll area. `Następne pytanie` stays client navigation; no new next-navigation logging was added.

Automatic source-catalog coaching calls are no longer attached to the learning deck. Other route adapters and the tutor elsewhere are unchanged.

Validation: TypeScript and targeted ESLint; no tests, build, paid provider calls or database scripts run. Manual smoke: Premium/Basic visibility, hint before submission, changed selection comparison, hidden/visible answer explanation, no-source results, follow-ups and narrow-screen overflow.

Follow-up: answer content has a viewport-bounded internal scroll area, preserving the avatar/bubble tail. Grounded replies, sources and recent conversation persist in an account/category/question/revision/selection-scoped Zustand localStorage store (latest 100 contexts). Prepared replies can be reopened without inference once the server-supplied card state confirms assistance/exposure. Full explanations never restore while the key is hidden. Follow-ups retain their own latest display instead of replacing the original prepared explanation. Restored text appears immediately without speaking/typing replay. A 14-day server Redis cache reuses grounded generated content after current access, revision, choice and reveal checks; new-session help still records current assistance before delivery. No-source/errors are not persisted as reusable answers. This browser persistence is distinct from the cells feature's database sync; no cross-device transcript sync was added.
