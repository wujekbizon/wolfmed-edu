# Wolfek token audit — 2026-10-01

Scope: Greg's two pasted exports, supplied daily metrics and TypeSafe dashboard screenshot; current source and live official documentation. Investigation only. No application changes, database mutations or paid inference.

## Verdict

Usage is real. The current implementation sends about 16,902 input tokens on every fresh Kierunki question. The API call count matches the submitted questions. The main problem is an unnecessarily large request built by the implementation: repeated response bodies and repeated catalog feature strings.

Every question should still reach Jev. Reducing duplicated context does not require a direct FAQ path, a forced answer selected by button identity, a routine decision cache or dropping the reviewed question types.

## Reconciliation

| Evidence | Calls | Input tokens | Output tokens | Total |
|---|---:|---:|---:|---:|
| Supplied audit export | 14 | 236,624 | 4,012 | 240,636 |
| Supplied provider daily metrics | 14 | 236,624 | 4,012 | 240,636 |
| TypeSafe screenshot, Sep 30 tooltip | Not shown | 246,025 | 4,849 | 250,874 |
| TypeSafe screenshot, summary counter | Not shown | Not separated | Not separated | 291,744 |

The 14 interaction rows match 14 distinct audit IDs and 14 distinct submission IDs. Eleven calls succeeded; three were rejected by the previous parser bug. Those three still consumed 50,695 input and 860 output tokens, because TypeSafe had already completed them. The parser fix prevents that known rejection, but does not reduce a request's size.

Mean input: 16,901.71 tokens/call. Observed range: 16,897–16,909. All attached calls are September 30, between 20:06:02 and 20:29:24 UTC.

The provided app tables reconcile exactly. Question-kind metrics contain zero tokens, so summing provider and interaction rows is not double-counting usage. The source copies usage directly from the returned payload and adds it once in the transaction inserting the audit row. Completing `wolfekDelivery` does not aggregate usage again. All exported audit rows have `usage_aggregated=true`.

The dashboard Sep 30 tooltip exceeds these exported rows by 9,401 input and 837 output tokens. Its summary counter is a different displayed total. Exact account-wide reconciliation needs the same date/timezone/key/project scope and complete provider-side history. Earlier calls removed by resetting our tables still remain in TypeSafe's usage history. The supplied screenshot cannot establish that all 291,744 tokens came from these 14 rows.

## Why each call is large

Measured from the first exported request using minified JSON character counts. Characters are a payload-size proxy, not Jev token counts.

| Part | Characters |
|---|---:|
| Entire request | 44,300 |
| `state.facts` | 17,202 |
| `state.responseOptions` | 9,982 |
| Choice criteria | 14,169 |
| Response objects copied inside those criteria | 9,559 |
| Noul + Score definitions | 1,839 |

All 14 calls send practically the same large bank: 25 response alternatives and three typed questions. Hiding buttons under More changes presentation, not the response bank sent to Jev.

1. `buildWolfekResponseRequest` sends each complete answer under `state.responseOptions`, then sends the same answer again inside its Choice criterion. The response content appears twice.
2. `getWolfekCatalogFacts` sends course objects both at `catalog.courses.<course>` and at `catalog.<course>`.
3. Each course's Basic feature text appears under several aliases: `basicFeaturesText`, `BasicFeaturesText`, `featuresText`, `examFeaturesText`, `growthFeaturesText`, and `goalFitText`. Including the duplicate course object makes the same Basic feature string appear 12 times in facts. Premium feature strings appear four times for Opiekun and Nursing.
4. Materialized responses contain some of those features again. The decision therefore receives the same facts through multiple representations.

Source files: `src/helpers/buildWolfekResponseRequest.ts`, `src/server/companion/getWolfekCatalogFacts.ts`, and `src/helpers/expandWolfekCourseResponses.ts`.

No automatic provider retry or parallel hidden Jev request was found in this path. `callJev` performs one fetch. Choice, Noul and Score share that request. Each deliberate click gets a fresh submission ID; only duplicate network submissions reuse a completed result.

## TypeSafe documentation

The [model reference](https://docs.typesafe.ai/models) documents input-token billing at $0.042/million, with output tokens free. The shared state is ingested once; the request budget includes state and all questions. Putting three questions in one request does not make three separate API calls, and it does not make redundant text free.

The [State guide](https://docs.typesafe.ai/concepts/state) separates evidence/material from the questions judging it. [Structured criteria](https://docs.typesafe.ai/primitives/advanced) are supported; this does not require duplicating complete response objects in both places. Our current duplication is an application choice, not a required TypeSafe envelope.

[Fan-out](https://docs.typesafe.ai/patterns/fan-out) supports independent questions in one call. Keep the three reviewed types unless a separate product decision changes diagnostics. Their definitions contribute much less text than the duplicated response/catalog bank.

The [documented model limitations](https://docs.typesafe.ai/model-jaggedness/jev-1.13) also recommend relevant, filtered context. Large unrelated state can reduce accuracy, so this cleanup addresses both efficiency and decision clarity. The [function-calling example](https://docs.typesafe.ai/cookbooks/function_calling) illustrates meaningful selection over known alternatives; it does not require dumping every duplicate application representation into state.

## Concrete smaller request proposal

An offline draft was built from the exported request, retaining the same 25 response objects, same 25 candidate IDs and the same Choice/Noul/Score definitions:

| Draft | Minified characters | Change |
|---|---:|---|
| Current request | 44,300 | Baseline |
| Response objects only in state | 34,441 | Remove copied `criteria[id].response` |
| Above + compact decision facts | 17,312 | Keep access context; answers already carry resolved product facts |

The final draft is 60.9% smaller by characters. This is not a measured 60.9% token/cost reduction: the exact new `usage.input_tokens` requires an explicitly authorized subsequent smoke call. No Jev call was made to obtain this comparison.

Review draft: [kierunki-compact-request.json](../reviews/2026-10-01-wolfek-tokens/kierunki-compact-request.json). It is a static historical example in the exact `model/state/questions` envelope, not a new runtime adapter. Its facts must be regenerated for the current viewer in an implementation.

Recommended implementation: materialize trusted complete responses locally; send them once in state; use Choice criteria for covers/excludes/availability and response IDs; send only distinct decision context that is not already expressed by those responses. Keep final action descriptors and delivery snapshots locally when they are unnecessary for selection. Preserve explicit missing/unknown states, all answer candidates, fresh Jev selection, access checks and logging.

Apply the same duplication cleanup to the common builder used by all four routes. Context trimming must be route-specific: learning may need current-card evidence and help history, while an app help response rarely needs a complete duplicated catalog. Do not arbitrarily remove evidence or shortlist answers using the clicked button's expected answer.

## Published-rate cost illustration

At the current published rate, 236,624 input tokens cost about $0.00994. At the observed mean, 1,000 calls cost about $0.71 and 100,000 about $70.99. These are TypeSafe input charges only; account-specific credits/terms and application infrastructure are outside this calculation. A low unit price does not justify unnecessarily repeated input.

## Remaining verification

- Provider account/timezone/project scope explaining the dashboard/export difference.
- Actual input-token reduction after implementing the compact request.
- Polish selection quality with equivalent compact context, using Greg's existing examples and unsupported questions.

Runtime code unchanged by this audit.
