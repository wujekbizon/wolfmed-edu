# Testing the Diagnozy i Interwencje module

Two layers: an **offline harness** (no Neon / Clerk needed) for the data +
logic, and a **manual walkthrough** in the running app for the UI.

## Offline harness (`pnpm run test:diagnozy`)

Exercises the real Drizzle schema, JSON-extraction query SQL, seed validation,
completion upsert, exam building, grading (incl. the mannequin `wykonanie`
step), attempt persistence, and chapter grouping against a **local Postgres** —
so it needs no cloud credentials and runs in seconds.

### One-time local Postgres

```bash
# Postgres 16 is installed on the box; start the cluster
pg_ctlcluster 16 main start

# a superuser role + a throwaway DB for tests
sudo -u postgres psql -c "CREATE ROLE wolftest LOGIN PASSWORD 'wolftest' SUPERUSER;"
sudo -u postgres createdb -O wolftest wolfmed_test

# allow TCP md5 auth (append to /etc/postgresql/16/main/pg_hba.conf):
#   host all wolftest 127.0.0.1/32 md5
# and set listen_addresses = '127.0.0.1' in postgresql.conf, then restart:
pg_ctlcluster 16 main restart
```

### Run

```bash
TEST_DATABASE_URL=postgres://wolftest:wolftest@127.0.0.1:5432/wolfmed_test \
  pnpm run test:diagnozy
```

The harness recreates its tables each run (drops + recreates the four
`wolfmed_*` tables in the test DB), so it is idempotent. It exits non-zero on
any failed assertion — wire it into CI once a Postgres service is available.
`TEST_DATABASE_URL` defaults to the local URL above if unset.

> The harness runs a **parallel** Drizzle client on the `postgres` driver
> pointed at local Postgres. It imports the same schema objects and mirrors the
> query SQL from `queries.ts`; it does not exercise the Neon transport (not our
> code) or Clerk auth (covered by the manual pass).

## Manual walkthrough (running app)

Needs `NEON_DATABASE_URL` in `.env.local`, `pnpm run db:push`, then
`npx tsx scripts/seed-diagnozy.ts`, and a login enrolled in `pielegniarstwo`
(basic tier). Full click-path:

1. **Sidebar** link visible only when enrolled in pielęgniarstwo.
2. **List** `/panel/diagnozy` — cards grouped by chapter, "Egzamin próbny" button.
3. **Nauka** — book breakdown (grouped lists, interventions table).
4. **Wypełnij** — pick diagnoza → add cele/interwencje → "Oznacz jako ukończone"
   → "Ukończone" chip appears back on the list.
5. **Egzamin** `/panel/diagnozy/egzamin` — 30-min countdown (auto-submits at 0),
   steps Diagnoza → Cel → Interwencje → **Wykonanie na fantomie** (3D mannequin,
   click a body zone per intervention) → Ocena → graded result + attempt history.

To test auto-submit quickly, temporarily set `EXAM_DURATION_MINUTES = 1` in
`src/components/diagnozy/egzamin/EgzaminRunner.tsx`.
