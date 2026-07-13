# Memory Feed — Implementation Plan

**Idea:** use the whole platform as a *deterministic* signal feed. Every meaningful
student action writes a fact/episode (no LLM), so the tutor knows the student's
performance, activity, and interests across tests, exams, RAG, mind maps, forums —
not just quizzes.

## Reuses (already built)
- `gate.promoteFact`, `stores/facts`, `stores/episodes`, `assemble` (M3), `erase` +
  retention cron (M5).
- Pattern: feature action → `after()` → an `onXxx()` extractor (like `onQuizCompleted`).

## New shared piece: keyword → category classifier
- `src/constants/memoryTopics.ts` (client-safe, tunable like preferences/policies):
  `KEYWORD_CATEGORY_MAP: Record<Category, string[]>` — Polish keyword lists per
  concept category (`anatomy, physiology, pathology, pharmacology, diagnostics,
  treatment, epidemiology, genetics, immunology`).
- `classifyTopic(text): Category | null` — lowercases, counts keyword hits, returns
  the best-matching category or `null` (no match → no fact). Deterministic, $0,
  one-file tuning.

## Event → memory map

| Event | Where | Episode | Fact (`factKey`) | Phase |
|---|---|---|---|---|
| Test completed | `submitTestAction` | quiz | weak/strong `quiz:<course-cat>` | ✅ done (M2) |
| Practical exam | `actions/praktyczny.ts` | exam | performance `exam:<cat>` | **A** |
| RAG / AI-assistant query | `askRagQuestion` | "pytał o …" (+ classified cat) | interest `interest:<cat>` | **B** |
| Mind map generated | `generateMindMapAction` | "mapa: …" (+ cat) | interest `interest:<cat>` | **B** |
| Forum post | `actions.ts` createPost | "dyskusja: …" (+ cat) | optional | **C** |

## Two fact types
- **Performance facts** — from *scored* events (tests ✅, exams). Deterministic
  weak/strong per category, superseded per category. Trivial (copy the quiz hook).
- **Interest facts** — from *classified free-text* events. Aggregated: count a
  user's classified events per category over a recent window; when a category
  crosses a threshold (e.g. ≥3), write/supersede an `interest:<cat>` fact
  ("Często korzysta z materiałów o <category>"). Bounded (one per category).

## Phases
- **Phase A — structured → facts.** Exam hook, mirrors the quiz hook. ~½ day. High
  value, clean (exams already carry a category + score).
- **Phase B — activity → episodes + interest facts.** Classifier + hooks on
  `askRagQuestion` and `generateMindMapAction`. Episodes are logged always; interest
  facts derived from counts. ~1 day.
- **Phase C — forum + tuning.** Optional; wire forum posts, tune keyword lists.

## Guards
- **Volume:** RAG/mindmap episodes accumulate. Extend the retention cron to age-out
  non-revoked episodes (keep last N per user, or >90 days) — currently it only
  purges revoked rows.
- **Privacy:** covered by M5 erasure (facts/episodes wiped on account deletion).
- **Noise:** classifier returns `null` on no match → no fact; interest facts are
  thresholded, never one-off.
- **Cost:** all deterministic. Embeddings stay best-effort (skipped under quota,
  Path B cascades to trgm).

## Not doing (from M4)
No LLM extraction, no chat distillation — the platform *is* the feed. Revisit only
if a conversational tutor chat ever ships.
