# Memory Feed — Implementation Plan

**Implemented:** meaningful committed learning events write facts/episodes without
LLM extraction. Raw tutor turns remain trace memory and are never promoted as
student facts.

## Reuses (already built)
- `gate.promoteFact`, `stores/facts`, `stores/episodes`, `assemble` (M3), `erase` +
  retention cron (M5).
- Pattern: feature action → `after()` → an `onXxx()` extractor (like `onQuizCompleted`).

## Event → memory map

| Event | Where | Episode | Fact (`factKey`) | Phase |
|---|---|---|---|---|
| Test completed | `submitTestAction` | quiz | weak/strong `quiz:<course-cat>` | ✅ done (M2) |
| Diagnozy exam | `actions/diagnozy.ts` | `diagnozy_exam` | `diagnozy:<slug>` | ✅ |
| Procedure challenge | challenge actions | `procedure_challenge` | `procedure:<id>` | ✅ |
| Practical exam | `actions/praktyczny.ts` | `practical_exam` via study log | no | ✅ |
| Manual/planner study | `actions/planner.ts` | `study_session` | no | ✅ |
| Tutor turn | `askRagQuestion` | trace only | never auto-promoted | ✅ |
| Mind-map mastery / flashcard review | client-only | no canonical completion | no | blocked by persistence |

## Promotion types
- **Performance facts** — from *scored* events (tests ✅, exams). Deterministic
  weak/strong per category, superseded per category. Trivial (copy the quiz hook).
- **Activity episodes** — committed completions and study-ledger writes.
- **Trace only** — free-form tutor text, never a durable student fact.

## Guards
- **Volume:** active episodes expire after 180 days; traces after 90 days.
- **Privacy:** covered by M5 erasure (facts/episodes wiped on account deletion).
- **Noise:** only committed scored/activity events promote. Tutor text stays trace-only.
- **Cost:** all deterministic. Embeddings stay best-effort (skipped under quota,
  Path B cascades to trgm).

## Not doing (from M4)
No LLM fact extraction or interest inference. Committed platform events remain
the promotion authority; traces exist for continuity, replay, and audit only.
