import assert from 'node:assert/strict'
import test from 'node:test'
import { filterAndSortDiagnozy } from '@/helpers/filterAndSortDiagnozy'
import type { DiagnozaListItem, DiagnozyBrowseCriteria } from '@/types/diagnozyTypes'

const criteria: DiagnozyBrowseCriteria = {
  search: 'lek przewlekly',
  chapter: '',
  status: 'all',
  sort: 'section-asc',
}

const diagnozy: DiagnozaListItem[] = [
  {
    id: '1',
    slug: 'bol-przewlekly',
    section: '1.1',
    chapterNumber: '1',
    chapterTitle: 'Komfort',
    title: 'Ból przewlekły',
    definicjaSnippet: 'Długotrwały lęk i dyskomfort pacjenta.',
  },
  {
    id: '2',
    slug: 'ryzyko-upadku',
    section: '1.2',
    chapterNumber: '1',
    chapterTitle: 'Bezpieczeństwo',
    title: 'Ryzyko upadku',
    definicjaSnippet: 'Zwiększone ryzyko urazu.',
  },
]

test('diagnozy retain Polish all-word search behavior', () => {
  const results = filterAndSortDiagnozy(diagnozy, [], criteria)

  assert.deepEqual(results.map((item) => item.slug), ['bol-przewlekly'])
})
