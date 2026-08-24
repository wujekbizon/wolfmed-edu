import assert from 'node:assert/strict'
import test from 'node:test'
import { PROCEDURE_BROWSE_DEFAULT_CRITERIA } from '@/constants/procedureBrowse'
import { filterAndSortProcedures } from '@/helpers/filterAndSortProcedures'
import { matchesSearchTerms } from '@/helpers/matchesSearchTerms'
import { toOpiekunProcedureBrowseItems } from '@/helpers/toOpiekunProcedureBrowseItems'
import { toPielegniastwoProcedureBrowseItems } from '@/helpers/toPielegniastwoProcedureBrowseItems'
import type { Procedure } from '@/types/dataTypes'
import type { PielegniastwoProcedure } from '@/types/pielegniastwoTypes'

const opiekunProcedures: Procedure[] = [
  {
    id: '1',
    data: {
      name: 'Zmiana opatrunku',
      image: '',
      procedure: 'Przygotuj jałowe rękawiczki i gaziki.',
      algorithm: [{ step: 'Wyjaśnij czynność pacjentowi.' }],
    },
  },
  {
    id: '2',
    data: {
      name: 'Pomiar tętna',
      image: '',
      procedure: 'Przygotuj zegarek.',
      algorithm: [{ step: 'Policz uderzenia.' }],
    },
  },
]

const pielegniastwoProcedures: PielegniastwoProcedure[] = [
  {
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
]

test('shared matcher ignores Polish diacritics', () => {
  assert.equal(matchesSearchTerms(['Pielęgnacja skóry'], 'pielegnacja skory'), true)
})

test('opiekun search matches words across description and steps', () => {
  const items = toOpiekunProcedureBrowseItems(opiekunProcedures)
  const results = filterAndSortProcedures(items, {
    ...PROCEDURE_BROWSE_DEFAULT_CRITERIA,
    search: 'rekawiczki pacjentowi',
  })

  assert.deepEqual(results.map((item) => item.name), ['Zmiana opatrunku'])
})

test('pielegniarstwo search includes sections, steps, and notes', () => {
  const items = toPielegniastwoProcedureBrowseItems(pielegniastwoProcedures)
  const results = filterAndSortProcedures(items, {
    ...PROCEDURE_BROWSE_DEFAULT_CRITERIA,
    search: 'czynnosci dlonie kciuki',
  })

  assert.deepEqual(results.map((item) => item.name), ['Higieniczna dezynfekcja rąk'])
})

test('procedure sorting supports Polish name order', () => {
  const items = toOpiekunProcedureBrowseItems(opiekunProcedures)
  const results = filterAndSortProcedures(items, {
    ...PROCEDURE_BROWSE_DEFAULT_CRITERIA,
    sort: 'name-asc',
  })

  assert.deepEqual(results.map((item) => item.name), ['Pomiar tętna', 'Zmiana opatrunku'])
})
