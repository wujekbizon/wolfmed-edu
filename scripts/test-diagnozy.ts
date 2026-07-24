/**
 * scripts/test-diagnozy.ts
 *
 * Offline testing ground for the Diagnozy i Interwencje module. Spins the real
 * Drizzle schema + query SQL against a local Postgres (no Neon / Clerk needed)
 * and exercises the pure helpers with assertions.
 *
 * Prereqs (already scripted in the session, kept here for reproducibility):
 *   pg_ctlcluster 16 main start
 *   createdb -O wolftest wolfmed_test
 *
 * Run:
 *   TEST_DATABASE_URL=postgres://wolftest:wolftest@127.0.0.1:5432/wolfmed_test \
 *     npx tsx scripts/test-diagnozy.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { eq, asc, sql } from 'drizzle-orm'
import {
  diagnozy,
  diagnozyProgress,
  diagnozyExamAttempts,
} from '../src/server/db/schema'
import { DiagnozyFileSchema } from '../src/server/schema'
import { buildDiagnozyExam } from '../src/helpers/buildDiagnozyExam'
import { gradeDiagnozyExam } from '../src/helpers/gradeDiagnozyExam'
import { groupDiagnozyByChapter } from '../src/helpers/groupDiagnozyByChapter'
import type { Diagnoza, DiagnozaListItem } from '../src/types/diagnozyTypes'

const url =
  process.env.TEST_DATABASE_URL ??
  'postgres://wolftest:wolftest@127.0.0.1:5432/wolfmed_test'

let passed = 0
let failed = 0
function check(name: string, cond: boolean, detail?: string) {
  if (cond) {
    passed++
    console.log(`  \x1b[32m✓\x1b[0m ${name}`)
  } else {
    failed++
    console.log(`  \x1b[31m✗ ${name}\x1b[0m${detail ? ` — ${detail}` : ''}`)
  }
}

async function main() {
  const client = postgres(url, { max: 1 })
  const db = drizzle(client, {
    schema: { diagnozy, diagnozyProgress, diagnozyExamAttempts },
  })

  // Fresh tables mirroring the real Drizzle schema (minimal users for the FK).
  await client.unsafe(`
    DROP TABLE IF EXISTS wolfmed_diagnozy_exam_attempts CASCADE;
    DROP TABLE IF EXISTS wolfmed_diagnozy_progress CASCADE;
    DROP TABLE IF EXISTS wolfmed_diagnozy CASCADE;
    DROP TABLE IF EXISTS wolfmed_users CASCADE;
    CREATE TABLE wolfmed_users ("userId" varchar(256) PRIMARY KEY);
    CREATE TABLE wolfmed_diagnozy (
      id uuid PRIMARY KEY,
      course varchar(100) NOT NULL DEFAULT 'pielegniarstwo',
      slug varchar(256) NOT NULL,
      section varchar(16) NOT NULL,
      "chapterNumber" varchar(8) NOT NULL,
      "chapterTitle" varchar(256) NOT NULL,
      title varchar(256) NOT NULL,
      status varchar(16) NOT NULL DEFAULT 'published',
      data jsonb NOT NULL,
      "createdAt" timestamp DEFAULT now(),
      "updatedAt" timestamp
    );
    CREATE TABLE wolfmed_diagnozy_progress (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "userId" varchar(256) NOT NULL REFERENCES wolfmed_users("userId") ON DELETE CASCADE,
      "diagnozaSlug" varchar(256) NOT NULL,
      "completedAt" timestamp NOT NULL DEFAULT now(),
      CONSTRAINT diagnozy_progress_user_slug_uq UNIQUE ("userId", "diagnozaSlug")
    );
    CREATE TABLE wolfmed_diagnozy_exam_attempts (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "userId" varchar(256) NOT NULL REFERENCES wolfmed_users("userId") ON DELETE CASCADE,
      "diagnozaSlug" varchar(256) NOT NULL,
      score integer NOT NULL,
      "stepScores" jsonb NOT NULL,
      "timeSpent" integer NOT NULL,
      passed boolean NOT NULL DEFAULT false,
      "completedAt" timestamp NOT NULL DEFAULT now()
    );
    INSERT INTO wolfmed_users VALUES ('user_test_1');
  `)

  // ── 1. Seed validation (real Zod schema) ──
  console.log('\n[1] Seed validation + insert')
  const raw = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'data', 'diagnozy.json'), 'utf-8')
  )
  const parsed = DiagnozyFileSchema.safeParse(raw)
  check('data/diagnozy.json passes DiagnozyFileSchema', parsed.success)
  if (!parsed.success) {
    console.error(parsed.error.issues.slice(0, 3))
    await client.end()
    process.exit(1)
  }
  const records = parsed.data.diagnozy

  for (const d of records) {
    await db.insert(diagnozy).values({
      id: d.id,
      course: 'pielegniarstwo',
      slug: d.slug,
      section: d.section,
      chapterNumber: d.chapter.number,
      chapterTitle: d.chapter.title,
      title: d.title,
      status: d.status,
      data: d as Diagnoza,
    })
  }
  const count = await db.select({ c: sql<number>`count(*)::int` }).from(diagnozy)
  check('all records inserted', count[0]!.c === records.length, `${count[0]!.c}/${records.length}`)

  // ── 2. getAllDiagnozy list query (JSON extraction SQL) ──
  console.log('\n[2] List query (json extraction + snippet + ordering)')
  const list = (await db
    .select({
      id: diagnozy.id,
      slug: diagnozy.slug,
      section: diagnozy.section,
      chapterNumber: diagnozy.chapterNumber,
      chapterTitle: diagnozy.chapterTitle,
      title: diagnozy.title,
      author: sql<string | null>`${diagnozy.data}->>'author'`,
      difficulty: sql<DiagnozaListItem['difficulty']>`${diagnozy.data}->>'difficulty'`,
      definicjaSnippet: sql<string>`left(${diagnozy.data}->>'definicja', 220)`,
    })
    .from(diagnozy)
    .where(eq(diagnozy.status, 'published'))
    .orderBy(asc(diagnozy.section))) as DiagnozaListItem[]

  check('list returns published rows', list.length === records.length)
  check('ordered by section asc', list[0]!.section <= list[list.length - 1]!.section)
  check('author extracted from jsonb', typeof list[0]!.author === 'string')
  check('snippet capped at 220 chars', list.every((r) => r.definicjaSnippet.length <= 220))

  // ── 3. getDiagnozaBySlug (relational findFirst) ──
  console.log('\n[3] Detail query by slug')
  const found = await db.query.diagnozy.findFirst({
    where: (m, { eq: e, and }) => and(e(m.slug, records[0]!.slug), e(m.status, 'published')),
  })
  check('found record by slug', !!found && found.data.slug === records[0]!.slug)
  check('jsonb round-trips interwencje', (found?.data.interwencje.length ?? 0) === records[0]!.interwencje.length)
  const missing = await db.query.diagnozy.findFirst({
    where: (m, { eq: e }) => e(m.slug, 'nie-istnieje'),
  })
  check('missing slug returns undefined', !missing)

  // ── 4. Completion upsert idempotency ──
  console.log('\n[4] Completion upsert (unique userId+slug)')
  const slug = records[0]!.slug
  await db.insert(diagnozyProgress).values({ userId: 'user_test_1', diagnozaSlug: slug }).onConflictDoNothing()
  await db.insert(diagnozyProgress).values({ userId: 'user_test_1', diagnozaSlug: slug }).onConflictDoNothing()
  const completions = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(diagnozyProgress)
    .where(eq(diagnozyProgress.userId, 'user_test_1'))
  check('double completion stays single row', completions[0]!.c === 1)

  // ── 5. buildDiagnozyExam (real helper) ──
  console.log('\n[5] Exam build (pooled distractors, no flags)')
  const drawn = records[0]!
  const siblings = records.slice(1)
  const exam = buildDiagnozyExam(drawn, siblings)
  check('exam has 4 answer steps', exam.steps.length === 4)
  const diagStep = exam.steps.find((s) => s.field === 'diagnoza')!
  check('correct diagnoza is in the option pool', diagStep.options.includes(drawn.diagnozaPielegniarska))
  check('pool is a plain string[] (no correctness flags)', diagStep.options.every((o) => typeof o === 'string'))
  check('diagnoza pool adds ≥1 distractor', diagStep.options.length > 1)
  const intStep = exam.steps.find((s) => s.field === 'interwencje')!
  check('interwencje options ⊇ all correct interventions', drawn.interwencje.every((i) => intStep.options.includes(i.interwencja)))

  // ── 6. gradeDiagnozyExam — answer steps (real grader, real data) ──
  console.log('\n[6] Grading — answer steps')
  const perfectAnswers = {
    diagnoza: [drawn.diagnozaPielegniarska],
    cele: drawn.celeOpieki,
    interwencje: drawn.interwencje.map((i) => i.interwencja),
    ocena: [drawn.oczekiwaneWyniki],
  }
  const perfect = gradeDiagnozyExam(drawn, perfectAnswers, {})
  check('perfect run scores 100', perfect.score === 100)
  const extraPenalty = gradeDiagnozyExam(drawn, { ...perfectAnswers, cele: [...drawn.celeOpieki, siblings[0]?.celeOpieki[0] ?? 'X'] }, {})
  check('extra wrong pick lowers a step below 100', extraPenalty.steps.find((s) => s.field === 'cele')!.scorePercent < 100)
  const allWrong0 = gradeDiagnozyExam(drawn, { diagnoza: siblings[0] ? [siblings[0].diagnozaPielegniarska] : [], cele: [], interwencje: [], ocena: [] }, {})
  check('empty/wrong run scores 0', allWrong0.score === 0)

  // ── 6b. Mannequin wykonanie grading — deterministic fixture ──
  // Body zones are authored per diagnosis; the dataset may carry none yet, so
  // the zone rubric is tested against a controlled fixture, not live data.
  console.log('\n[6b] Grading — mannequin wykonanie (fixture)')
  const fixture: Diagnoza = {
    ...drawn,
    interwencje: [
      { interwencja: 'Osłuchanie płuc', uzasadnienie: 'x', exam: { bodyZone: 'klatka-piersiowa' } },
      { interwencja: 'Pobranie krwi', uzasadnienie: 'x', exam: { bodyZone: 'konczyny-gorne' } },
      { interwencja: 'Dokumentacja', uzasadnienie: 'x' },
    ],
  }
  const fixInt = fixture.interwencje.map((i) => i.interwencja)
  const fixAnswers = { diagnoza: [], cele: [], interwencje: fixInt, ocena: [] }
  const rightZones = { 'Osłuchanie płuc': 'klatka-piersiowa' as const, 'Pobranie krwi': 'konczyny-gorne' as const }
  const fx = gradeDiagnozyExam(fixture, fixAnswers, rightZones)
  const fxWyk = fx.steps.find((s) => s.field === 'wykonanie')
  check('wykonanie present when zones authored', !!fxWyk)
  check('correct zones → wykonanie 100%', fxWyk?.scorePercent === 100)
  const fxWrong = gradeDiagnozyExam(fixture, fixAnswers, { 'Osłuchanie płuc': 'konczyny-dolne', 'Pobranie krwi': 'noga' as 'konczyny-dolne' })
  check('wrong zones → wykonanie 0%', fxWrong.steps.find((s) => s.field === 'wykonanie')?.scorePercent === 0)
  const fxUnassigned = gradeDiagnozyExam(fixture, fixAnswers, {})
  check('unassigned-but-applicable → wykonanie present at 0%', fxUnassigned.steps.find((s) => s.field === 'wykonanie')?.scorePercent === 0)
  const fxSkip = gradeDiagnozyExam(fixture, { diagnoza: [], cele: [], interwencje: ['Dokumentacja'], ocena: [] }, {})
  check('no chosen intervention has a zone → wykonanie skipped', !fxSkip.steps.some((s) => s.field === 'wykonanie'))

  const allWrong = gradeDiagnozyExam(drawn, { diagnoza: siblings[0] ? [siblings[0].diagnozaPielegniarska] : [], cele: [], interwencje: [], ocena: [] }, {})
  check('empty/wrong run scores 0', allWrong.score === 0)

  // ── 7. Persist an exam attempt ──
  console.log('\n[7] Exam attempt persistence')
  await db.insert(diagnozyExamAttempts).values({
    userId: 'user_test_1',
    diagnozaSlug: drawn.slug,
    score: perfect.score,
    stepScores: perfect.steps.map(({ field, scorePercent }) => ({ field, scorePercent })),
    timeSpent: 640,
    passed: perfect.passed,
  })
  const attempts = await db.select().from(diagnozyExamAttempts).where(eq(diagnozyExamAttempts.userId, 'user_test_1'))
  check('attempt row persisted with score', attempts.length === 1 && attempts[0]!.score === 100)
  check('stepScores stored as jsonb array', Array.isArray(attempts[0]!.stepScores))

  // ── 8. groupDiagnozyByChapter (real helper) ──
  console.log('\n[8] Chapter grouping')
  const chapters = groupDiagnozyByChapter(list)
  check('groups share chapter number', chapters.every((c) => c.diagnozy.every((d) => d.chapterNumber === c.number)))
  check('every record kept once', chapters.reduce((n, c) => n + c.diagnozy.length, 0) === list.length)

  await client.end()

  console.log(`\n${failed === 0 ? '\x1b[32m' : '\x1b[31m'}${passed} passed, ${failed} failed\x1b[0m`)
  process.exit(failed === 0 ? 0 : 1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
