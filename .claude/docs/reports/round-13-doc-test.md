# Doc-Test Report — Round 13

**Methodology change, per explicit direction this round**: every prior round started from a doc claim (or a source file) and checked it. This round inverts the order: **simulate a real-world problem symptom first** — a plausible bug report, support ticket, or "something's wrong" observation, arrived at by reading actual application code with fresh, adversarial eyes, *before* opening any doc — then go into `.claude/docs/` **only with that symptom in hand** and see whether the docs get a technical reader to the right diagnosis and fix location. The question isn't "is this fact documented" anymore; it's "if this problem happened, would the docs actually help someone fix it."

Verdict key: **✅ SOLVED** (docs led straight to accurate root cause) / **⚠️ PARTIAL** (docs got close but missing a detail needed to fully close the loop) / **❌ MISLED** (docs actively describe the behavior narrower/differently than it actually is, which would send a diagnostician down the wrong path or make them wrongly rule out the real cause).

---

## Scenario 1 — "A student says their timed test session got marked EXPIRED while they were still actively answering questions, and they lost their progress."

**❌ MISLED — the most serious finding of any round so far, both as an app bug and as a documentation gap.**

Docs-first path: `14-api-routes.md` and `31-flows-testing.md` both describe the expiry mechanism as: a 5-minute inactivity cron sweep, a heartbeat every so often bumping `lastActivityAt`, and `useBeaconCleanup` firing `POST /api/session/expire` "on unload/navigation-away" or "on tab close/navigation-away." Read as documented, none of this explains "expired while still active" — the reasonable conclusion from the docs alone is a network blip on the heartbeat, or user error (they really did close the tab).

**What's actually in the source** (`src/hooks/useBeaconCleanup.ts`, `src/hooks/useSessionHeartbeat.ts`, both wired together in `GenerateTests.tsx` — the actual test-taking component):

```js
// useBeaconCleanup.ts
const handleVisibilityChange = () => {
  if (document.hidden) {
    expireSession()   // navigator.sendBeacon('/api/session/expire', ...)
  }
}
document.addEventListener('visibilitychange', handleVisibilityChange)
```

This does **not** fire only on tab-close/navigation-away. `document.hidden` becomes `true` on **any** visibility loss — switching browser tabs, minimizing the window, the OS backgrounding the tab, or (very plausible for a phone-based student) the screen locking. Any of those immediately and unconditionally expires the session via a real network call, with no grace period, no check against the heartbeat's own 5-minute tolerance, and no way back — a student who alt-tabs for ten seconds to check something loses their in-progress test exactly like they'd closed it.

There's a second, independent trigger compounding it: `useSessionHeartbeat.ts`'s own `useEffect` cleanup **unconditionally** fires the same `sendBeacon` expire call on any effect cleanup (deps: `[sessionId, router]`), separate from `useBeaconCleanup`'s visibility handler entirely — two different code paths both capable of expiring a session that the 5-minute-heartbeat design was clearly built to tolerate.

**Why this counts as the docs actively misleading, not just a gap**: `22-hooks.md` describes `useBeaconCleanup` as firing "on unload/navigation-away" — a specific, narrower claim than what the code does, not an omission. A developer debugging this exact ticket, reading that line, would reasonably rule out "did the app expire this on purpose" and go looking elsewhere (network flakiness, a heartbeat bug, browser throttling) — the doc doesn't just fail to help, it points away from the actual cause. The existing QA case (`40-testing-guide.md`, "Edge case C — abandoned tab") only tests closing the tab, which is the one scenario where this behavior is actually correct — it would never have caught the tab-switch variant.

**Not fixed in this round** (this is app behavior, not a documentation slip — the current punch list convention in this doc set is to document it accurately and let the user/team decide the product fix, per README audit notes #9–#15). Documented accurately below and flagged as a new numbered audit note; a testing-guide case added for the tab-switch variant specifically, since the existing case wouldn't catch it.

## Scenario 2 — "A student bought premium but a support agent testing the same account sees some test categories still gated as basic-only."

**✅ SOLVED — and better than expected.** Docs-first path: `00-architecture.md` and `30-flows-auth-payments.md` state plainly that access is DB-authoritative (`courseEnrollments`, via `checkCourseAccessAction`/`checkPremiumAccessAction`) and Clerk `publicMetadata` is a non-authoritative UI shortcut only — ruling out "is Clerk metadata stale" as the cause in one read. Following the tier-check trail into `25-helpers.md` surfaces the actual likely cause **directly**: `buildAccessibleCategories.ts` and `populateCategories.ts` independently reimplement the identical course-access/tier-filter algorithm against two different callers, a known, already-documented duplication (README audit note #14). If one code path gets a tier fix and the other doesn't, this exact "premium in one place, not another" symptom is precisely what it would produce. The docs didn't just answer the lookup — they surfaced a standing, named suspect for the reported symptom before I had to go looking for one myself.

## Scenario 3 — "The AI tutor gave a confident, detailed answer to a question that isn't in the curriculum or the student's notes — is it hallucinating?"

**✅ SOLVED.** `33-flows-ai-tutor.md` names the exact gate (`!context.hasCanonical && context.chunks.length === 0` → `getNoDataFoundMessage()`, called "the single most load-bearing check in the whole function") and the file it lives in. Verified against `src/actions/rag-actions.ts:493` — exact match. A reader chasing this ticket would correctly conclude: check whether `context.chunks` really was empty (a retrieval miss that should have triggered the gate but didn't — a real bug) versus the gate firing correctly and the model's answer coming from something that did retrieve, just not what the reporter expected (a UX/relevance issue, not a hallucination). The doc draws that exact distinction, which is the right next question to ask.

---

## New README audit-note finding

**16. `useBeaconCleanup`/`useSessionHeartbeat` expire an active test session on any tab-visibility loss, not just close/navigation-away** (found in round 13, simulating a "session expired while still active" ticket before consulting the docs): `useBeaconCleanup.ts`'s `visibilitychange` handler fires `POST /api/session/expire` whenever `document.hidden` becomes true — tab switch, window minimize, OS backgrounding, phone screen lock — with no grace period and no coordination with the heartbeat's 5-minute tolerance. `useSessionHeartbeat.ts`'s effect cleanup independently fires the same expire beacon on any cleanup of that effect. Both hooks are wired together in `GenerateTests.tsx`, the live test-taking component. If intentional (e.g. an anti-cheating measure against tabbing away to search answers), nothing in the code or docs frames it that way, and it contradicts the heartbeat/5-minute-threshold design built to tolerate exactly this kind of temporary inactivity. Flagging as a product-intent question, the same way audit note #10 (materials re-indexing) was. See [`31-flows-testing.md`](../31-flows-testing.md) and the new [`40-testing-guide.md`](../40-testing-guide.md) case below.

---

## Priority fix list for next round

1. Simulate 3–4 more symptom-first scenarios in the same style — this round's methodology found the single highest-value result of all 13 rounds on the first attempt, precisely because "is X documented" and "does X's documentation match what actually happens under a realistic trigger" are different questions, and only the second one caught this.
2. Good candidates for next round, picked the same way (read real code for a plausible failure trigger, *then* check the docs): the RAG corpus admin flow (single-deletion-tears-down-everything is known — is there a subtler trigger nobody's looked at yet), the Stripe double-submit idempotency gap (audit note #13) re-tested as a symptom ("a student says they were charged twice") to see if the docs would actually lead a support agent to the right explanation quickly, and the `library-index` cron backstop (audit note #10) as a symptom ("a premium user says their uploaded material never comes up in tutor answers").

## Running tally across all 13 rounds

- **16 numbered README audit-note findings** (was 15 — round 13 adds #16, the first *new* app-behavior finding, not a doc-coverage gap, since round 7's F-16/F-17).
- **Testing guide**: 18 cases (was 17 — added a tab-switch-specific case; the existing "abandoned tab" case only covers actual tab close).
- This round's 3 scenarios: 2 ✅ solved cleanly, 1 ❌ actively misleading — the first time this doc set has scored a scenario as worse than "not documented."
