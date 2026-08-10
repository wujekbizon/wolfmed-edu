import assert from 'node:assert/strict'
import test from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import FieldError from '../../src/components/FieldError'
import FormError from '../../src/components/FormError'
import type { FormState } from '../../src/types/actionTypes'
import { DeleteCategorySchema } from '../../src/server/schema'
import Input from '../../src/components/ui/Input'
import { getFormStringValues } from '../../src/helpers/getFormStringValues'

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

test('submitted string fields and checked boxes survive an error round trip', () => {
  const formData = new FormData()
  formData.set('question', 'Test question')
  formData.set('option1', 'Answer one')
  formData.set('checkbox1', 'on')
  formData.set('attachment', new Blob(['ignored']))

  assert.deepEqual(getFormStringValues(formData), {
    question: 'Test question',
    option1: 'Answer one',
    checkbox1: 'on',
  })
})

test('Input forwards restored text and checkbox defaults', () => {
  const text = renderToStaticMarkup(createElement(Input, {
    name: 'option1',
    defaultValue: 'Answer one',
  }))
  const checkbox = renderToStaticMarkup(createElement(Input, {
    name: 'checkbox1',
    type: 'checkbox',
    defaultChecked: true,
  }))

  assert.match(text, /value="Answer one"/)
  assert.match(checkbox, /checked=""/)
})
