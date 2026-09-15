import { readFile } from 'node:fs/promises'
import type { StagedTestSeedRecord, TestSeedRecord } from './testSeedTypes'

const COURSES = new Set(['opiekun-medyczny', 'pielegniarstwo', 'angielski-medyczny', 'jezyk-migowy'])
const TEST_SEED_FILES = ['data/tests.json', 'data/pjmBasicTests.json']

function normalizeDate(value: string | null | undefined) {
  if (!value || /^\d{4}-0-/.test(value)) return null
  const normalized = value.replace(' ', 'T').replace(/(\.\d{3})\d*$/, '$1')
  const date = new Date(normalized)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

function validateRecord(record: TestSeedRecord) {
  if (!record.id) throw new Error('Test without ID')
  if (!COURSES.has(record.meta?.course)) {
    throw new Error(`Noncanonical course on ${record.id}: ${record.meta?.course}`)
  }
  if (!record.meta.category || !record.data?.question || !record.data.answers?.length) {
    throw new Error(`Invalid test record: ${record.id}`)
  }
  if (record.data.answers.some((answer) =>
    !answer.option || (answer.isCorrect !== undefined &&
      typeof answer.isCorrect !== 'boolean'))) {
    throw new Error(`Invalid answers on test: ${record.id}`)
  }
}

export async function loadTestSeed(): Promise<StagedTestSeedRecord[]> {
  const sources = await Promise.all(TEST_SEED_FILES.map(async (path) => ({
    path,
    records: JSON.parse(await readFile(path, 'utf8')) as unknown,
  })))
  for (const source of sources) {
    if (!Array.isArray(source.records)) throw new Error(`${source.path} must contain an array`)
  }
  const source = sources.flatMap((item) => item.records as TestSeedRecord[])

  const ids = new Set<string>()
  return source.map((record) => {
    validateRecord(record)
    if (ids.has(record.id)) throw new Error(`Duplicate test ID: ${record.id}`)
    ids.add(record.id)
    return {
      id: record.id,
      meta: record.meta,
      data: record.data,
      created_at: normalizeDate(record.createdAt),
      updated_at: normalizeDate(record.updatedAt),
    }
  })
}
