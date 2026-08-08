# Doc-Test Report — Round 4

Per round 3's recommendations: rotated coverage onto `23-types.md` and `27-state-stores.md` directly, and deliberately included a "verify a claimed safety/limitation property is actually true" negative-case task rather than letting one turn up incidentally.

---

## Part A — Mechanical checks

Link validation: 0 broken. Referenced-file existence (147 paths, `reports/` excluded): 0 missing. No `file:line` sample this round — three straight rounds at 16/16 with zero source changes made the marginal value of a 4th identical check low; resuming it next round is still the right default, this was a deliberate one-round skip, not a dropped practice.

## Part B — Task-based coverage

| # | Task | Result |
|---|---|---|
| T21 | Find the type for a client-safe (answer-stripped) generated quiz | ✅ `GeneratedQuizPlayView`, 2 hops, correctly cross-referenced to `stripQuizAnswers` |
| T22 | Get the exact allowed values of `RetrievalMode`, not just an example | ⚠️ **Imprecise, now fixed** — see F-10 |
| T23 | Confirm what `useMobileStore` actually holds | ✅ was already correctly hedged ("likely"); confirmed against source and de-hedged |
| T24 | Deliberate negative case: does the Stripe "Buy" flow actually protect against a double-submit the way the adjacent customer-creation call does? | ❌ **No, and this is real** — see F-11 |
| T25 | (surfaced while checking T23) Is `useSettingsStore` really the only store that persists to localStorage, as an earlier doc pass implied? | ❌ **No — 9 of 27 do** — see F-12 |

### F-10 (Imprecision, now fixed) — `RetrievalMode`'s values were framed as examples, not a closed set
`00-architecture.md` said a feature declares a mode "e.g. `canonical_only`, `canonical_with_personal`, `explicit_resource`" — technically listing all three real values, but the "e.g." phrasing reads as a sample from a longer list. The type itself is a **closed union of exactly three**, and its own source comment explains *why* it's closed (not independent booleans, since "corpus: false, personal: false" isn't a state anything wants). Reworded to state the closed set explicitly and carry the design rationale, and added the same precision to `23-types.md`'s entry so a reader landing there directly gets it too, not just readers who happen to go through the architecture doc first.

### F-11 (Real, verified gap) — Stripe checkout session creation has no idempotency key
The deliberate negative-case task for this round: "prove the claimed race-protection extends to the whole purchase flow, not just the part that's documented as protected." `createCheckoutSession` (`src/actions/stripe.ts`) calls `getOrCreateStripeCustomer()` (has an idempotency key, explicitly commented as guarding against a double-click race) immediately followed by `stripe.checkout.sessions.create()` (does not — confirmed by grepping the entire `stripe.ts`/`actions/stripe.ts` pair for every `idempotencyKey` usage: exactly one hit). A rapid double-submit can create two Checkout Sessions; if a user completes both, two `payments` rows and a double `testLimit` credit land, since each session fires an independently-ided webhook event that the `processedEvents` replay guard doesn't dedupe against (it only catches literal redelivery of the *same* event, not two different events from two different sessions). Course enrollment itself stays correct either way. Documented in the flow doc, the testing guide (TC-2 Edge case D), and a new numbered README audit note (#13) — this is a real, small, fixable gap, not speculation.

### F-12 (Overstatement, now fixed) — "only `useSettingsStore` persists" was never actually verified
While resolving round 1's speculative audit note about `useSettingsStore` vs. `useSettingsModalStore` (round 2), I checked those two stores' source but generalized ("only this one survives a page reload") without checking the other 25. A full grep this round found **9 of 27 stores** use `persist`. Fixed the overstatement, and added a consolidated "which stores persist" section to `27-state-stores.md` rather than scattering the correction across individual entries — this is exactly the kind of cross-cutting fact that belongs in one place a reader can find by searching "persist," not buried in one store's row. Also surfaced a genuinely well-designed detail worth documenting on its own merits: `useSearchTermStore` uses `partialize` to persist display prefs but deliberately **excludes** the live search term, with a source comment explaining why (a stale persisted filter would silently empty a fresh visit's results) — added as its own testing-guide case (TC-12) since it's a real, checkable behavior distinction (search term resets, display prefs don't).

**Pattern note**: F-12 is a case of doc-testing finding its own earlier mistake — a correction made in round 2 to fix one inaccuracy (F-4/#4 in the audit list) introduced a *new*, smaller inaccuracy by generalizing from a sample of 2 instead of checking all 27. Worth remembering when fixing a finding: fix the specific claim, but don't add a new unverified claim in the same edit. Grep first, generalize second.

---

## Priority fix list for next round

1. No systematic issue found this round needs a follow-up pass the way F-8 (round 3's admin-claims grep) did — but F-12's lesson (verify the *replacement* claim as rigorously as the *original* one) is worth keeping in mind rather than turning into a specific action item.
2. Resume the `file:line` sampling next round (skipped this round by design, not by neglect).
3. Coverage still untouched by a direct task across 4 rounds: `24-constants.md` (only touched via the `commands.ts`/`toolCommands.ts` resolution) and the `10-14` page docs' API-route coverage specifically (`14-api-routes.md` has had light touch — cron auth, that's it). Round 5 candidates.

## Running tally across all 4 rounds

- **13 numbered README audit-note findings**, of which 4 were resolved-as-fine (not bugs) and 9 are real, ranging from cosmetic (filename typo) to functionally real (materials indexing, comment-lock scope, checkout idempotency).
- **Mechanical checks**: 0 broken links across all 4 rounds, 0 missing referenced files (after round-2's scoping fix), 16/16 sampled `file:line` accuracy where checked.
- **Testing guide**: 12 test cases now, every one traceable to a specific flow doc section.
- Every real finding across all 4 rounds (F-1, F-2, F-6, F-7, F-8, F-10, F-11, F-12) came from task-based tracing or from deliberately checking a claim against source — never from re-reading a doc in isolation. Mechanical checks earn continued cheap execution but haven't found a *new* class of problem since round 1's F-1; they're a floor, not where the value is.
