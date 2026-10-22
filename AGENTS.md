# Repository Agent Instructions

Before doing any work in this repository, read [`CLAUDE.md`](./CLAUDE.md) completely.

Treat the entire current contents of `CLAUDE.md` as repository instructions, including:

- architecture and server/client boundaries;
- coding and component conventions;
- modal, state, form, database, and migration rules;
- testing, validation, Git, and documentation workflows;
- warnings, examples, referenced files, and linked documentation.

Do not rely on a summary or copy of `CLAUDE.md`. Read the source file itself so future updates apply automatically. Re-read relevant sections before changing related code.

Follow higher-priority system, developer, and direct user instructions if they conflict with `CLAUDE.md`.

## Test-driven development

- For new or changed behavior, use TDD within Greg's approved scope: write a behavior test first, confirm it fails for the expected reason, implement the smallest change that passes, then refactor while keeping tests passing.
- Keep approved reproduction tests as regression coverage once they demonstrate an audit issue or an optimization's benefit. Do not add tests for every ordinary bug or make unrelated coverage changes automatically.

### Audit findings: propose reproduction before fixes

This workflow applies to suspected edge cases, performance/cost problems and optimization opportunities found during audits. It is not a requirement to test every ordinary bug.

1. First explain the audit hypothesis and propose the smallest useful reproduction or integration test. State expected behavior and measurable work/cost before/after the proposed change, real versus mocked services, costs, data changes and cleanup.
2. Wait for Greg's explicit approval before writing or running that test. Finding an issue is not authorization to create tests or change application code.
3. After approval, write the test and either run it within the approved scope or give Greg the exact command to run manually. Reproduce the issue against existing behavior first. Compare an isolated candidate fix in the test harness when approved; leave application code unchanged.
4. Report what the results prove and their limitations. For optimization findings, compare relevant work such as query counts, context volume or blocking dependencies while preserving correct answers and authorization. If the hypothesis is not demonstrated, discuss next steps with Greg instead of applying the change automatically.
5. Apply the application fix only after Greg reviews the results and explicitly approves it. Then rerun the approved test to verify the fix and restore temporary data/settings.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
