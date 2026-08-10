import assert from 'node:assert/strict'
import test from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import FieldError from '../../src/components/FieldError'
import FormError from '../../src/components/FormError'
import type { FormState } from '../../src/types/actionTypes'
import { DeleteCategorySchema } from '../../src/server/schema'

const state = (overrides: Partial<FormState>): FormState => ({
  status: 'ERROR',
  message: '',
  fieldErrors: {},
  timestamp: 1,
  ...overrides,
})

test('FieldError renders only its named server error', () => {
  const html = renderToStaticMarkup(createElement(FieldError, {
    name: 'email',
    formState: state({
      message: 'Form error',
      fieldErrors: { email: ['Invalid email'], name: ['Invalid name'] },
    }),
  }))

  assert.match(html, /Invalid email/)
  assert.doesNotMatch(html, /Invalid name|Form error/)
})

test('FormError renders the first server field error once', () => {
  const html = renderToStaticMarkup(createElement(FormError, {
    formState: state({ fieldErrors: { id: ['Invalid ID'], name: ['Invalid name'] } }),
  }))

  assert.match(html, /Invalid ID/)
  assert.doesNotMatch(html, /Invalid name/)
})

test('FormError ignores form-wide messages', () => {
  const html = renderToStaticMarkup(createElement(FormError, {
    formState: state({ message: 'Toast only' }),
  }))

  assert.equal(html, '')
})

test('delete-category validation maps to its visible field', () => {
  const result = DeleteCategorySchema.safeParse({ category: '' })

  assert.equal(result.success, false)
  if (!result.success) {
    assert.deepEqual(result.error.flatten().fieldErrors.category, ['Kategoria jest wymagana.'])
  }
})
