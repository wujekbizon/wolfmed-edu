# Bug Resolution Report — Round 17

Resolution of the Server Action/form/exam audit merged in PR #56.

## Fixed

| Area | Confirmed bug | Resolution |
|---|---|---|
| Forum deletion | Post/comment authorization trusted client-submitted `authorId`; delete mutations also used React `cache()` | Ownership now comes from authenticated `userId` and is enforced in uncached SQL mutations. Post authors may delete child comments. |
| Lecture quota | Deleting an AI-generated lecture removed the row but did not refund MP3 storage | New lectures persist byte size; deletion atomically refunds it, floored at zero. Historical rows remain `size: 0` because their size is unknown. |
| Testimonials | Updates overwrote `createdAt` | Updates now write `updatedAt`. |
| Form errors | Toast/form-wide/field errors overlapped and some fields displayed another field's error | `message` is toast-only, `FieldError` is field-only, and button forms use `FormError`. Server Zod errors map to named fields. |
| Form value retention | Manual test, AI test, note, and flashcard forms lost submitted values after server validation failed | Submitted values now return through form state and repopulate controlled/default fields. |
| Manual test form | Category error rendered in the wrong place; one answer error appeared under all answer inputs | Category error moved to its field; answer errors map by exact answer index. |
| Note deletion | Successful deletion had no confirmation | Success toast added. |
| Test cell | A question could be saved with zero or multiple correct answers | Server schema now requires exactly one correct answer. |
| Theory exam submission | Failed validation lost/randomly restored selections; grading trusted unstable submitted answer identity; only toast was shown | Question/option order is deterministic per session. Client submits indexes; server reloads canonical questions, validates every expected answer, grades server-side, preserves selections, and returns toast plus inline general error. |
| Theory exam timer | Client timer and server session deadline could disagree | Timer uses the absolute server deadline. Server expiry uses typed `Date` comparison under row lock. |
| Theory exam lifecycle | React Strict Mode/Fast Refresh cleanup could expire an active session; completed submission could remain on the exam URL and then show missing-session text | Same-session remount cancels stale cleanup. Completed owned sessions redirect server-side to `/panel/wyniki`. |
| Practical exam scoring | Three labels required 5/5/6 list answers while scoring awarded maximum credit at 4/4/5 | Thresholds now match labels: 5/5/6. |

## Not bugs / intended behavior

| Report | Verdict |
|---|---|
| Theory exam expires when switching tabs, minimizing, backgrounding, or locking the device | Intended anti-cheat behavior. `document.hidden`/`pagehide` still expire the session. Only false React lifecycle expiry was fixed. |
| Uploaded material quota already refunds after deletion, therefore lecture quota leak was false | Material deletion was already correct, but AI lectures use a separate path. The lecture deletion leak was real and fixed. |
| Practical exam permits incomplete fields | Intended. Blank answers submit and score zero; the practical exam has no strict persistent session. No required-field blocking was added. |
| Practical exam grading can be spoofed from the browser | False. The action reloads the canonical owned/static exam and grades server-side; answer keys are stripped from form fields before rendering. |
| Previous theory score helper removal means all earlier score calculations were necessarily wrong | False as a general claim. It was replaced because the submission contract changed to deterministic option indexes and canonical server grading. |

## Still open, outside this fix

- Board/cells multi-tab overwrite risk: no optimistic concurrency.
- Remaining cached query mutations: latent footgun, no reproduced incident.
- RAG bulk upload reports failed count but not filenames.

## Verification

- 134 automated tests passed.
- Manual checks covered form retention, field placement, Test cell validation, theory exam submission/expiry/results redirect, and practical threshold behavior.
- Database schema changed for `lectures.size`; that migration was applied during testing.
