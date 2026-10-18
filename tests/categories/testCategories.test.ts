import assert from 'node:assert/strict'
import test from 'node:test'
import { populateTestCategories } from '@/helpers/populateTestCategories'
import { CATEGORY_METADATA, DEFAULT_CATEGORY_METADATA } from '@/constants/categoryMetadata'

test('grouped category counts retain metadata, counts and Polish display names', () => {
  const result = populateTestCategories([
    { category: 'opiekun-medyczny', course: 'opiekun-medyczny', count: 357 },
    { category: 'nowa-kategoria', course: 'pielegniarstwo', count: 14 },
  ])
  assert.deepEqual(result[0], {
    category: 'Opiekun Medyczny', value: 'opiekun-medyczny', count: 357,
    data: CATEGORY_METADATA['opiekun-medyczny'],
  })
  assert.deepEqual(result[1], {
    category: 'Nowa Kategoria', value: 'nowa-kategoria', count: 14,
    data: { ...DEFAULT_CATEGORY_METADATA, category: 'nowa-kategoria', course: 'pielegniarstwo' },
  })
})

test('case variants never hide an accessible canonical category', () => {
  const rows = [
    { category: 'OPIEKUN-MEDYCZNY', course: 'opiekun-medyczny', count: 2 },
    { category: 'opiekun-medyczny', course: 'opiekun-medyczny', count: 357 },
  ]
  for (const ordered of [rows, [...rows].reverse()]) {
    const result = populateTestCategories(ordered)
    assert.equal(result.length, 1)
    assert.equal(result[0]?.value, 'opiekun-medyczny')
    assert.equal(result[0]?.count, 357)
  }
})
