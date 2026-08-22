# Tests

Unit tests for pure logic (layout algorithms, tree/data transforms, helpers).
They use Node's built-in test runner (`node:test`) via `tsx`, so there is **no
extra test framework** to install.

## Running

```bash
pnpm test          # runs every tests/**/*.test.ts
```

## Conventions

- One folder per module, mirroring the source area under test
  (e.g. `tests/mindmap/` covers `src/lib/mindmap/`).
- Name files `*.test.ts`.
- Import the code under test with the `@/` alias (e.g.
  `@/lib/mindmap/radialLayout`), not relative paths — tests stay
  location-independent.
- Keep tests focused on pure, deterministic logic; UI/server-action flows are
  verified by running the app.
