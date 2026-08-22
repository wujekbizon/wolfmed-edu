import assert from 'node:assert/strict'
import test from 'node:test'
import { gradeSessionAnswers } from '../../src/helpers/gradeSessionAnswers'
import { selectSessionTests } from '../../src/helpers/selectSessionTests'
import type { Test as ExamTest } from '../../src/types/dataTypes'

const tests: ExamTest[] = Array.from({ length: 4 }, (_, index) => ({
  id: `00000000-0000-0000-0000-00000000000${index}`,
  data: {
    question: `Question ${index}`,
    answers: [
      { option: 'Wrong A', isCorrect: false },
      { option: 'Correct', isCorrect: true },
      { option: 'Wrong B', isCorrect: false },
    ],
  },
  meta: { course: 'course', category: 'category' },
}))

test('session questions and answer order are deterministic', () => {
  const first = selectSessionTests(tests, 3, 'session-one')
  const second = selectSessionTests([...tests].reverse(), 3, 'session-one')

  assert.deepEqual(first, second)
  assert.equal(first.length, 3)
})

test('server grades selected indexes against canonical answers', () => {
  const selected = selectSessionTests(tests, 2, 'session-two')
  const submitted = Object.fromEntries(selected.map((question) => [
    `answer-${question.id}`,
    String(question.data.answers.findIndex((answer) => answer.isCorrect)),
  ]))

  const result = gradeSessionAnswers(selected, submitted)
  assert.equal(result.success, true)
  if (result.success) assert.equal(result.correct, 2)
})

test('server rejects missing, extra, and invalid answers', () => {
  const selected = selectSessionTests(tests, 2, 'session-three')
  const firstKey = `answer-${selected[0]!.id}`
  const valid = Object.fromEntries(selected.map((question) => [`answer-${question.id}`, '0']))

  assert.equal(gradeSessionAnswers(selected, { [firstKey]: '0' }).success, false)
  assert.equal(gradeSessionAnswers(selected, { ...valid, 'answer-forged': '0' }).success, false)
  assert.equal(gradeSessionAnswers(selected, { ...valid, [firstKey]: '99' }).success, false)
  assert.equal(gradeSessionAnswers(selected, { ...valid, [firstKey]: 'true' }).success, false)
})
