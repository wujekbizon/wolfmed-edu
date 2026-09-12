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

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
