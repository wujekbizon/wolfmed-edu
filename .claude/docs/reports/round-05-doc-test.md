# Doc-Test Report — Round 5

Per round 4's notes: rotated coverage onto `24-constants.md` and `14-api-routes.md` directly, and resumed the `file:line` drift sample (skipped once, by design, in round 4).

---

## Part A — Mechanical checks

Link validation: 0 broken (148 doc-internal links). Referenced-file existence (`reports/` excluded): 148 paths, 0 missing. `file:line` sample, 8 fresh references across `stripe.ts`, `db.ts`, `library/config.ts`, `retrievalTypes.ts`, `diagnozy.ts`, `challenges.ts`, `actions.ts`, `requireAdmin.ts`: **8/8 accurate** — 24/24 across the three rounds that have run this check.

## Part B — Task-based coverage

| # | Task | Result |
|---|---|---|
| T26 | Is there a central catalog of rate-limit bucket names and their actual limits, or just scattered string literals? | ❌ **Real, substantial gap** — see F-13 |
| T27 | Confirm `RAG_TOP_K`/`RAG_TOP_K_BROAD`'s actual numeric values are documented somewhere, not just the constant names | ⚠️ **Minor gap, fixed** — neither `00-architecture.md` nor `24-constants.md` stated the numbers (12 / 20); added inline |
| T28 | Does the UploadThing router (`core.ts`) do anything beyond what's described as "not duplicated here"? | ❌ **Real gap** — see F-14 |
| T29 | Negative case: is the `CRON_SECRET` comparison constant-time? | ✅ Checked, genuinely low-severity (plain `!==`, standard practice for this kind of check) — documented as a one-line note, deliberately **not** added as a numbered audit item, to keep that list calibrated to things that matter |

### F-13 (Substantial gap, now fixed) — Rate limiting had zero central documentation
T26 started as "is there a table of rate limits I could check before adding a new one" and turned up that `src/lib/rateLimit.ts` — the single file every `checkRateLimit()` call in the codebase routes through — had **never been named** anywhere in `.claude/docs/`, despite dozens of flow-doc sentences saying things like "rate-limited (`test:start`)" without ever pointing at where that number lives. The file itself is substantial and worth knowing about on its own terms:
- 35+ buckets in one `RATE_LIMITS` config object, each independently tuned (spans `testimonial:create` at 2/hour to `forum:seen` at 120/hour, with several `/day` rather than `/hour` windows for the expensive AI-generation buckets).
- A genuinely sliding window (Redis sorted sets), not fixed-window.
- **Fails open on Redis errors** — a deliberate availability-over-strictness choice, explicitly commented in the source. This is the kind of fact that changes how someone debugs "why didn't this rate limit trigger" (answer: maybe Redis was down, and that's by design, not a bug).
- Calling `checkRateLimit` with a bucket name that isn't in the config **throws** — worth knowing before adding a new rate-limited action.

Added a full "Rate limiting" section to `00-architecture.md` (architecture-level, since this is used across nearly every action file, not scoped to one domain) plus a testing-guide case (TC-14) that specifically tests the fail-open behavior as a documented design decision, not a suspected bug.

### F-14 (Gap, now fixed) — UploadThing's router does more than "not duplicated here" implied
`14-api-routes.md` correctly said the file router lives in `core.ts` rather than duplicating its contents — reasonable at the time, but reading it for T28 surfaced a detail worth surfacing regardless: `materialUploader`'s middleware checks the user's storage quota **before the file finishes transferring**, rejecting an over-quota upload at the transport layer, not just inside `uploadMaterialAction`'s DB transaction afterward. This is a genuine two-layer defense the [`32-flows-learning-content.md`](./32-flows-learning-content.md) flow doc's Flow 2 only described one layer of. Added the detail to `14-api-routes.md`, cross-linked it from the flow doc, and added a testing-guide case (TC-15) that specifically checks the rejection happens at upload time, not after.

---

## Priority fix list for next round

1. No doc has yet been tested by trying to use it to **onboard to a specific subsystem from zero** (e.g. "I'm new, I need to add a new AI tutor `/command` — walk the docs as my only reference and see how far I get without guessing"). Every task so far has been a targeted lookup; round 6 should try one deliberately broader, multi-step task that chains several docs together, to test whether the doc set holds up for a bigger job, not just point lookups.
2. `26-components.md` has had essentially no direct task coverage since round 1 (F-2's fix) — worth a fresh lookup task or two now that it's been edited.
3. Continue the `file:line` sample every round going forward — 24/24 accurate is a good track record, worth protecting rather than assuming it'll stay clean forever.

## Running tally across all 5 rounds

- **14 numbered README audit-note findings** (13 + this round hasn't added a numbered one, since F-13/F-14 are pure documentation gaps rather than app-behavior findings — they went into the relevant docs directly rather than the audit list, which is reserved for things about the *app's* behavior, not the *docs'* prior gaps). Worth naming that distinction explicitly: the audit list tracks findings about the codebase; gaps in doc coverage itself (F-2, F-6, F-13, F-14) get fixed in place and mentioned in the round report, not added to that list.
- **Testing guide**: 15 cases.
- Mechanical checks: still 0 broken links, 0 missing files, 24/24 `file:line` accuracy.
