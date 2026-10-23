# Practical exam timing reproduction

Run from repository root:

```powershell
pnpm exec tsx --test tests/integration/practicalExamTiming.integration.ts
```

Requires Playwright and Chromium/Chrome. When Playwright is supplied by the Codex bundled runtime, set `CODEX_TEST_NODE_MODULES` to its returned Node packages directory. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` when using an existing Chrome executable. No package installation or package manifest changes needed.

Uses real React/ReactDOM, the current `usePracticalExamState`, `PracticalExamTimer` and countdown hook in headless Chrome. Playwright controls Date and timers. Grading is an in-memory pending-promise mock; study logging uses the server's current minute conversion formula. Toasts are stubbed. Browser network requests are blocked, and bundling rejects server/service dependencies. No `.env`, external calls, database writes or charges.

The probe uses a minimal form with the same expiry callback wiring as the workspace; it is not a full application/browser navigation test. A source guard rejects changes to that wiring. It does not run the real grading action, authentication or persistence. Submission events can exceed mock grading calls because React queues actions while one is pending.

Tests assert desired behaviour. The baseline exited 1; after the approved fixes all five checks pass. They are deliberately outside the normal `tests/**/*.test.ts` suite and remain as regression coverage.

Measured baseline:

| Case | Expected | Observed |
| --- | --- | --- |
| 180 seconds then submit | 180 seconds; 3 study minutes | 0 seconds; 1 mock study minute |
| Expiry with pending/error rerenders | 1 submission | 4 form submissions; 2 mock grading calls started |
| Manual submission pending at expiry | 1 submission | 3 form submissions; 1 mock grading call started |
| Restart countdown | No old deadline; new deadline expires | Pass |

Contexts and browser close in cleanup, including when assertions fail. No application source is modified by the harness.

Approved fix results:

| Case | Observed |
| --- | --- |
| 180 seconds then submit | 180 seconds; 3 mock study minutes |
| Expiry with pending/error rerenders | 1 submission; 1 mock grading call |
| Manual submission pending at expiry | 1 submission; 1 mock grading call |
| Restart countdown | Pass |
| Manual retry after error, 20 seconds later | Calls receive 180 then 200 seconds |

Elapsed metadata is captured synchronously before React constructs submission FormData. The form still dispatches the original grading action directly. Countdown uses the same start time; timeout has a once-per-mounted-attempt guard and respects pending manual submission. A synchronous submission guard blocks concurrent attempts and releases after the action settles. Server grading, validation, logging implementation and answers are unchanged.
