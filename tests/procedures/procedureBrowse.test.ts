import assert from 'node:assert/strict'
import test from 'node:test'
import { PROCEDURE_BROWSE_DEFAULT_CRITERIA } from '@/constants/procedureBrowse'
import { filterAndSortProcedures } from '@/helpers/filterAndSortProcedures'
import { matchesSearchTerms } from '@/helpers/matchesSearchTerms'
import type {
  OpiekunProcedureBrowseItem,
  PielegniastwoProcedureBrowseItem,
} from '@/types/procedureBrowseTypes'

const opiekunProcedures: OpiekunProcedureBrowseItem[] = [
  {
    id: '1',
    slug: 'zmiana-opatrunku',
    updatedAt: '2026-01-01T00:00:00.000Z',
    course: 'opiekun-medyczny',
    data: {
      name: 'Zmiana opatrunku',
      image: '',
      procedure: 'Przygotuj jałowe rękawiczki i gaziki.',
      algorithm: [{ step: 'Wyjaśnij czynność pacjentowi.' }],
    },
  },
  {
    id: '2',
    slug: 'pomiar-tetna',
    updatedAt: '2026-01-01T00:00:00.000Z',
    course: 'opiekun-medyczny',
    data: {
      name: 'Pomiar tętna',
      image: '',
      procedure: 'Przygotuj zegarek.',
      algorithm: [{ step: 'Policz uderzenia.' }],
    },
  },
]

const pielegniastwoProcedures: PielegniastwoProcedureBrowseItem[] = [
  {
    id: '3',
    slug: 'higieniczna-dezynfekcja-rak',
    updatedAt: '2026-01-01T00:00:00.000Z',
    course: 'pielegniarstwo',
    data: {
      meta: { course: 'pielegniarstwo', category: 'podstawy-pielegniarstwa' },
      name: 'Higieniczna dezynfekcja rąk',
      image: '',
      executionTime: '30 sekund',
      totalPoints: 10,
      passingPoints: 7,
      sections: [
        {
          title: 'Czynności właściwe',
          steps: [{ number: 1, step: 'Wetrzyj preparat w dłonie.', points: 2 }],
        },
      ],
      notes: 'Zwróć uwagę na kciuki.',
    },
  },
]

test('shared matcher ignores Polish diacritics', () => {
  assert.equal(matchesSearchTerms(['Pielęgnacja skóry'], 'pielegnacja skory'), true)
})

test('opiekun search matches words across description and steps', () => {
  const results = filterAndSortProcedures(opiekunProcedures, {
    ...PROCEDURE_BROWSE_DEFAULT_CRITERIA,
    search: 'rekawiczki pacjentowi',
  })

  assert.deepEqual(results.map((item) => item.data.name), ['Zmiana opatrunku'])
})

test('pielegniarstwo search includes sections, steps, and notes', () => {
  const results = filterAndSortProcedures(pielegniastwoProcedures, {
    ...PROCEDURE_BROWSE_DEFAULT_CRITERIA,
    search: 'czynnosci dlonie kciuki',
  })

  assert.deepEqual(results.map((item) => item.data.name), ['Higieniczna dezynfekcja rąk'])
})

test('procedure sorting supports Polish name order', () => {
  const results = filterAndSortProcedures(opiekunProcedures, {
    ...PROCEDURE_BROWSE_DEFAULT_CRITERIA,
    sort: 'name-asc',
  })

  assert.deepEqual(results.map((item) => item.data.name), ['Pomiar tętna', 'Zmiana opatrunku'])
})
