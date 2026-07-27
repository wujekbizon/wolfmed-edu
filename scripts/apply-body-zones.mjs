/**
 * scripts/apply-body-zones.mjs
 *
 * Writes the reviewed finalZone column from data/body-zones-review.csv back
 * into data/diagnozy.json as exam.bodyZone, then leaves seed-diagnozy.ts to
 * validate and push it.
 *
 * Rows are matched on slug + index and the intervention text is verified, so
 * a stale review file fails loudly instead of writing zones onto the wrong
 * interventions. Blank finalZone clears any existing value.
 *
 * Usage:
 *   node scripts/apply-body-zones.mjs [--dry-run]
 */

import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const DIAGNOZY_PATH = path.join(process.cwd(), 'data', 'diagnozy.json')
const TYPES_PATH = path.join(process.cwd(), 'src', 'types', 'diagnozyTypes.ts')
const REVIEW_PATH = path.join(process.cwd(), 'data', 'body-zones-review.csv')
const dryRun = process.argv.includes('--dry-run')

function readBodyZones() {
  const source = readFileSync(TYPES_PATH, 'utf-8')
  const block = source.match(/export const BODY_ZONES = \[([\s\S]*?)\] as const/)
  if (!block) throw new Error('Could not find BODY_ZONES in diagnozyTypes.ts')
  return new Set([...block[1].matchAll(/'([^']+)'/g)].map((match) => match[1]))
}

function parseCsv(text) {
  const rows = []
  let row = []
  let value = ''
  let quoted = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]

    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        value += '"'
        i++
      } else if (char === '"') {
        quoted = false
      } else {
        value += char
      }
      continue
    }

    if (char === '"') quoted = true
    else if (char === ',') {
      row.push(value)
      value = ''
    } else if (char === '\n') {
      row.push(value)
      rows.push(row)
      row = []
      value = ''
    } else if (char !== '\r') {
      value += char
    }
  }

  if (value !== '' || row.length > 0) {
    row.push(value)
    rows.push(row)
  }

  return rows.filter((entry) => entry.some((cell) => cell !== ''))
}

const zones = readBodyZones()
const file = JSON.parse(readFileSync(DIAGNOZY_PATH, 'utf-8'))
const bySlug = new Map(file.diagnozy.map((diagnoza) => [diagnoza.slug, diagnoza]))

const [header, ...rows] = parseCsv(readFileSync(REVIEW_PATH, 'utf-8'))
const column = Object.fromEntries(header.map((name, index) => [name, index]))
for (const required of ['slug', 'index', 'interwencja', 'finalZone']) {
  if (column[required] === undefined) throw new Error(`Review file is missing "${required}"`)
}

const errors = []
let assigned = 0
let cleared = 0

rows.forEach((row, line) => {
  const slug = row[column.slug]
  const index = Number(row[column.index])
  const zone = row[column.finalZone].trim()
  const expected = row[column.interwencja]

  const diagnoza = bySlug.get(slug)
  const item = diagnoza?.interwencje?.[index]

  if (!item) {
    errors.push(`line ${line + 2}: no intervention for ${slug}[${index}]`)
    return
  }
  if (item.interwencja !== expected) {
    errors.push(`line ${line + 2}: text mismatch for ${slug}[${index}] — review file is stale`)
    return
  }
  if (zone && !zones.has(zone)) {
    errors.push(`line ${line + 2}: unknown zone "${zone}"`)
    return
  }

  if (zone) {
    item.exam = { ...(item.exam ?? {}), bodyZone: zone }
    assigned++
  } else if (item.exam?.bodyZone) {
    delete item.exam.bodyZone
    if (Object.keys(item.exam).length === 0) delete item.exam
    cleared++
  }
})

if (errors.length > 0) {
  console.error(`Refusing to write — ${errors.length} problem(s):`)
  for (const error of errors.slice(0, 20)) console.error(`  ${error}`)
  process.exit(1)
}

console.log(`assigned: ${assigned}`)
console.log(`cleared:  ${cleared}`)

if (dryRun) {
  console.log('\n--dry-run — data/diagnozy.json not modified')
} else {
  writeFileSync(DIAGNOZY_PATH, `${JSON.stringify(file, null, 2)}\n`, 'utf-8')
  console.log('\nwritten: data/diagnozy.json — run seed-diagnozy.ts to validate and push')
}
