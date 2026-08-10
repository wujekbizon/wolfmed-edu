# Cells concurrency resolution — Round 18

PR: [#57](https://github.com/wujekbizon/wolfmed-edu/pull/57) → `practical-exam` (draft).

## Confirmed

- Main and the working branch used the same check-then-insert/update code.
- `userCellsList.userId` had only a non-unique index.
- Production export was clean: 35 rows, 35 users, no structural errors.
- Dev contained two structurally identical rows for one user, confirming the first-save race.
- The transaction callback never used its `tx`; all writes ran through the global DB handle.

## Fixed

- Migration rejects divergent duplicates, removes identical duplicates, adds `version`, and enforces unique `userId`.
- Save is now an uncached atomic insert/compare-and-swap update.
- Stale divergent saves write nothing and return the current server snapshot.
- Local storage tracks the base server version and dirty state; hydration reconciles legacy data.
- Conflict UI preserves local work and requires an explicit server/local choice.
- Choosing local keeps the complete draft across refresh; the next save overwrites
  only if the server version is still current, otherwise it conflicts again.
- Conflict banner scrolls into view, receives focus, and replaces the redundant toast.
- Dirty Sync uses the global layout-level confirmation modal; no browser alerts/confirms.
- Full board validation rejects duplicate order IDs, missing cells, orphan cells, and mismatched IDs.
- Pending saves lock every rendered Save control; Sync confirms before dropping dirty work.

## Verification

- Dev duplicate removed; one row remains with `version = 0` and unique `userId` index.
- 141 automated tests passed.
- TypeScript passed.
- Production build passed.
- TC-19 now specifies the manual two-tab conflict test.
