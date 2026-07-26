/**
 * scripts/suggest-body-zones.mjs
 *
 * Proposes an `exam.bodyZone` for every intervention in data/diagnozy.json and
 * writes data/body-zones-review.csv for a human to correct.
 *
 * The mannequin step of the exam only grades interventions that carry an
 * authored bodyZone (see gradeWykonanie) — with none authored, that step is
 * silently skipped. This produces the first draft of that authoring.
 *
 * The reviewer edits the finalZone column: keep it, replace it with another
 * zone, or blank it for interventions that have no body site (education,
 * psychological support, documentation). Then run apply-body-zones.mjs.
 *
 * Existing exam.bodyZone values are treated as authored and kept. Pass
 * --resuggest to re-derive every row from the current rules instead, which is
 * what you want after correcting them — the column then shows the new
 * suggestion and previousZone records what it replaces.
 *
 * Usage:
 *   node scripts/suggest-body-zones.mjs [--resuggest]
 */

import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { suggestBodyZone } from './lib/bodyZoneRules.mjs'

const DIAGNOZY_PATH = path.join(process.cwd(), 'data', 'diagnozy.json')
const TYPES_PATH = path.join(process.cwd(), 'src', 'types', 'diagnozyTypes.ts')
const OUTPUT_PATH = path.join(process.cwd(), 'data', 'body-zones-review.csv')
const resuggest = process.argv.includes('--resuggest')

// Read the zone list from the type definition so this can never drift from the
// enum the Zod schema validates against.
function readBodyZones() {
  const source = readFileSync(TYPES_PATH, 'utf-8')
  const block = source.match(/export const BODY_ZONES = \[([\s\S]*?)\] as const/)
  if (!block) throw new Error('Could not find BODY_ZONES in diagnozyTypes.ts')
  return [...block[1].matchAll(/'([^']+)'/g)].map((match) => match[1])
}

function toCsvValue(value) {
  const text = String(value ?? '')
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

const zones = readBodyZones()
const { diagnozy } = JSON.parse(readFileSync(DIAGNOZY_PATH, 'utf-8'))

const rows = []
const stats = { high: 0, medium: 0, low: 0, none: 0, existing: 0, changed: 0 }

for (const diagnoza of diagnozy) {
  ;(diagnoza.interwencje ?? []).forEach((item, index) => {
    const existing = item.exam?.bodyZone ?? ''
    const suggestion = suggestBodyZone(item.interwencja)

    const keepExisting = existing && !resuggest
    const finalZone = keepExisting ? existing : (suggestion?.zone ?? '')

    if (keepExisting) stats.existing++
    else if (!suggestion) stats.none++
    else stats[suggestion.confidence]++

    if (existing && finalZone !== existing) stats.changed++

    rows.push({
      slug: diagnoza.slug,
      section: diagnoza.section,
      index,
      interwencja: item.interwencja,
      suggestedZone: suggestion?.zone ?? '',
      confidence: suggestion?.confidence ?? 'none',
      alternatives: suggestion?.alternatives.join(' ') ?? '',
      previousZone: existing,
      finalZone,
    })
  })
}

const header = [
  'slug',
  'section',
  'index',
  'interwencja',
  'suggestedZone',
  'confidence',
  'alternatives',
  'previousZone',
  'finalZone',
]

const csv = [
  header.join(','),
  ...rows.map((row) => header.map((key) => toCsvValue(row[key])).join(',')),
].join('\n')

writeFileSync(OUTPUT_PATH, `${csv}\n`, 'utf-8')

const suggested = stats.high + stats.medium + stats.low
console.log(`diagnozy:            ${diagnozy.length}`)
console.log(`interwencje:         ${rows.length}`)
console.log(`already authored:    ${stats.existing}`)
console.log(`suggested:           ${suggested}`)
console.log(`  high confidence:   ${stats.high}`)
console.log(`  medium confidence: ${stats.medium}`)
console.log(`  low confidence:    ${stats.low}`)
console.log(`no body site:        ${stats.none}`)
if (resuggest) console.log(`changed vs authored: ${stats.changed}`)
console.log(`\nvalid zones: ${zones.join(', ')}`)
console.log(`written: ${path.relative(process.cwd(), OUTPUT_PATH)}`)
