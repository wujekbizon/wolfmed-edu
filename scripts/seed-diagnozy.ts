import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import postgres from 'postgres'
import { DiagnozyFileSchema } from '@/server/schema'

const execute = process.argv.includes('--execute')
const pruneExtras = process.argv.includes('--prune-extras')
const expectedHost = process.argv.find((arg) => arg.startsWith('--expected-host='))
  ?.split('=')[1]
const connectionString = process.env.NEON_DATABASE_URL

if (!connectionString || !expectedHost) {
  throw new Error('NEON_DATABASE_URL and --expected-host are required')
}
if (new URL(connectionString).hostname !== expectedHost) {
  throw new Error('Unexpected Neon endpoint')
}
if (pruneExtras && !execute) throw new Error('--prune-extras requires --execute')

const parsed = DiagnozyFileSchema.safeParse(
  JSON.parse(await readFile('data/diagnozy.json', 'utf8')),
)
if (!parsed.success) throw parsed.error

const ids = new Set<string>()
const slugs = new Set<string>()
const staged = parsed.data.diagnozy.map((row) => {
  if (ids.has(row.id) || slugs.has(row.slug)) {
    throw new Error(`Duplicate Diagnozy ID or slug: ${row.id} / ${row.slug}`)
  }
  ids.add(row.id)
  slugs.add(row.slug)
  return {
    id: row.id, course: 'pielegniarstwo', slug: row.slug,
    section: row.section, chapter_number: row.chapter.number,
    chapter_title: row.chapter.title, title: row.title, data: row,
  }
})
const sql = postgres(connectionString, { max: 1, onnotice: () => undefined })

try {
  const result = await sql.begin(async (transaction) => {
    const json = staged as unknown as Parameters<typeof transaction.json>[0]
    await transaction`CREATE TEMP TABLE migration_diagnozy_seed (
      id uuid PRIMARY KEY, course varchar(100), slug varchar(256) UNIQUE,
      section varchar(16), chapter_number varchar(8),
      chapter_title varchar(256), title varchar(256), data jsonb
    ) ON COMMIT DROP`
    await transaction`INSERT INTO migration_diagnozy_seed
      SELECT source.id::uuid, source.course, source.slug, source.section,
        source.chapter_number, source.chapter_title, source.title, source.data
      FROM jsonb_to_recordset(${transaction.json(json)}::jsonb) AS source(
        id text, course text, slug text, section text, chapter_number text,
        chapter_title text, title text, data jsonb
      )`
    const [before] = await transaction`SELECT
      COUNT(*) FILTER (WHERE target.id IS NULL)::int AS inserts,
      COUNT(*) FILTER (WHERE target.id IS NOT NULL AND target.data IS DISTINCT FROM source.data)::int AS updates,
      COUNT(*) FILTER (WHERE target.id IS NOT NULL AND target.data IS NOT DISTINCT FROM source.data)::int AS unchanged,
      (SELECT COUNT(*)::int FROM wolfmed_diagnozy target WHERE NOT EXISTS (
        SELECT 1 FROM migration_diagnozy_seed source WHERE source.id = target.id
      )) AS extras
      FROM migration_diagnozy_seed source
      LEFT JOIN wolfmed_diagnozy target ON target.id = source.id`

    if (execute) {
      await transaction`INSERT INTO wolfmed_diagnozy
        (id, course, slug, section, "chapterNumber", "chapterTitle", title, data)
        SELECT id, course, slug, section, chapter_number, chapter_title, title, data
        FROM migration_diagnozy_seed ON CONFLICT (id) DO UPDATE SET
          course=excluded.course, slug=excluded.slug, section=excluded.section,
          "chapterNumber"=excluded."chapterNumber",
          "chapterTitle"=excluded."chapterTitle", title=excluded.title, data=excluded.data`
      if (pruneExtras) await transaction`DELETE FROM wolfmed_diagnozy target
        WHERE NOT EXISTS (SELECT 1 FROM migration_diagnozy_seed source WHERE source.id=target.id)`
    }

    const [after] = await transaction`SELECT
      (SELECT COUNT(*)::int FROM wolfmed_diagnozy) AS database_rows,
      COUNT(*) FILTER (WHERE target.id IS NULL)::int AS missing,
      COUNT(*) FILTER (WHERE target.id IS NOT NULL AND target.data IS DISTINCT FROM source.data)::int AS mismatched,
      (SELECT COUNT(*)::int FROM wolfmed_diagnozy target WHERE NOT EXISTS (
        SELECT 1 FROM migration_diagnozy_seed source WHERE source.id=target.id
      )) AS extras FROM migration_diagnozy_seed source
      LEFT JOIN wolfmed_diagnozy target ON target.id=source.id`
    if (execute && (!after || after.missing || after.mismatched || after.extras)) {
      throw new Error('Diagnozy synchronization verification failed')
    }
    return { before, after }
  })
  process.stdout.write(`${JSON.stringify({ status: execute ? 'synchronized' : 'dry-run',
    endpoint: expectedHost, sourceRows: staged.length, ...result }, null, 2)}\n`)
} finally {
  await sql.end()
}
