import assert from 'node:assert/strict'
import test from 'node:test'
import { DEFAULT_CATEGORY_METADATA } from '@/constants/categoryMetadata'
import {
  CUSTOM_CATEGORIES_FILTER,
  NAUKA_CATEGORY_DEFAULT_CRITERIA,
} from '@/constants/naukaCategoriesBrowse'
import { filterAndSortNaukaCategories } from '@/helpers/filterAndSortNaukaCategories'
import { getNaukaCourseSelectOptions } from '@/helpers/getNaukaCourseSelectOptions'
import type { PopulatedCategories } from '@/types/categoryType'

function courseCategory(
  category: string,
  course: string,
  count: number,
  keywords: string[] = []
): PopulatedCategories {
  return {
    category,
    value: category.toLocaleLowerCase('pl').replaceAll(' ', '-'),
    count,
    data: {
      ...DEFAULT_CATEGORY_METADATA,
      category,
      course,
      description: `Materiały: ${category}`,
      keywords,
    },
  }
}

const categories: PopulatedCategories[] = [
  courseCategory('Pielęgniarstwo chirurgiczne', 'pielegniarstwo', 80),
  courseCategory('Opiekun medyczny', 'opiekun-medyczny', 30, ['MED.14']),
  { category: 'Moje trudne pytania', value: 'moje-testy__1', count: 12 },
]

test('search ignores Polish diacritics and matches every term', () => {
  const results = filterAndSortNaukaCategories(categories, {
    ...NAUKA_CATEGORY_DEFAULT_CRITERIA,
    search: 'pielegniarstwo chirurgiczne',
  })

  assert.deepEqual(results.map((item) => item.category), ['Pielęgniarstwo chirurgiczne'])
})

test('search includes metadata keywords', () => {
  const results = filterAndSortNaukaCategories(categories, {
    ...NAUKA_CATEGORY_DEFAULT_CRITERIA,
    search: 'med.14',
  })

  assert.deepEqual(results.map((item) => item.category), ['Opiekun medyczny'])
})

test('course filter keeps only matching course', () => {
  const results = filterAndSortNaukaCategories(categories, {
    ...NAUKA_CATEGORY_DEFAULT_CRITERIA,
    course: 'pielegniarstwo',
  })

  assert.deepEqual(results.map((item) => item.category), ['Pielęgniarstwo chirurgiczne'])
})

test('custom filter keeps only user categories', () => {
  const results = filterAndSortNaukaCategories(categories, {
    ...NAUKA_CATEGORY_DEFAULT_CRITERIA,
    course: CUSTOM_CATEGORIES_FILTER,
  })

  assert.deepEqual(results.map((item) => item.category), ['Moje trudne pytania'])
})

test('question count sorting is stable by Polish name on ties', () => {
  const results = filterAndSortNaukaCategories(
    [...categories, courseCategory('Anatomia', 'pielegniarstwo', 30)],
    { ...NAUKA_CATEGORY_DEFAULT_CRITERIA, sort: 'questions-desc' }
  )

  assert.deepEqual(results.map((item) => item.category), [
    'Pielęgniarstwo chirurgiczne',
    'Anatomia',
    'Opiekun medyczny',
    'Moje trudne pytania',
  ])
})

test('course options include known labels and custom categories', () => {
  const options = getNaukaCourseSelectOptions(categories)

  assert.deepEqual(options, [
    { value: '', label: 'Wszystkie kursy' },
    { value: 'opiekun-medyczny', label: 'Opiekun medyczny' },
    { value: 'pielegniarstwo', label: 'Pielęgniarstwo' },
    { value: CUSTOM_CATEGORIES_FILTER, label: 'Moje kategorie' },
  ])
})
