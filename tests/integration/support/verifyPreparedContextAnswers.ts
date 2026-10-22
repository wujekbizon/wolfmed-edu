import assert from 'node:assert/strict'
import questions from '@/content/wolfek/questions.json'
import { getWolfekPreparedAnswer } from '@/helpers/getWolfekPreparedAnswer'
import { packs, preparedInput } from '../../companion/fixtures/wolfekPrepared'
import { preparedContextProbe as probe } from './preparedContextProbe'

export async function verifyPreparedContextAnswers() {
  const { getWolfekAppContext } = await import('@/server/companion/getWolfekAppContext')
  const { executeWolfekPreparedQuestion: execute } = await import('@/server/companion/executeWolfekPreparedQuestion')
  const { validateWolfekReplay } = await import('@/server/companion/validateWolfekReplay')
  let compared = 0
  for (const failure of [null, 'home.billing', 'home.plan', 'tests.categories']) {
    for (const route of ['panel.home', 'panel.results', 'kierunki'] as const) {
      probe.reset()
      probe.failedRead = failure
      const full = await getWolfekAppContext('f03-user', route)
      for (const { id } of questions[route]) {
        const input = preparedInput(route, id)
        const expected = getWolfekPreparedAnswer(input, packs[route], full)
        const result = await execute('f03-user', input)
        assert.equal(result.status, 'SUCCESS', `${route}:${id}:${failure}`)
        assert.deepEqual(result.answer, expected, `Answer changed: ${route}:${id}:${failure}`)
        compared++
      }
    }
  }

  for (const [id, allowed] of [
    ['billing', ['home.billing']], ['plan', ['home.plan']], ['badges', ['home.badges']],
    ['countdown', ['home.plan']], ['courses', []], ['navigation', []],
    ['results', ['tests.totals', 'tests.categories', 'tests.difficult']],
  ] as const) {
    probe.reset()
    await execute('f03-user', preparedInput('panel.home', id))
    assert.deepEqual(probe.reads.filter(name => name !== 'access.enrollment').sort(),
      [...allowed].sort(), `Unrelated reads for prepared ${id}`)
  }

  probe.reset()
  const input = preparedInput('panel.home', 'motto')
  const result = await execute('f03-user', input)
  probe.reset()
  await validateWolfekReplay('f03-user', input, result)
  assert.deepEqual(probe.reads.filter(name => name !== 'access.enrollment'), [])

  probe.reset()
  const history = preparedInput('panel.results', 'results_history')
  const previous = await execute('f03-user', history)
  probe.completedTestCount = 18
  await assert.rejects(validateWolfekReplay('f03-user', history, previous), /Dane lub dostęp/)
  console.log(`${compared} prepared answers match full context, including failed reads; selective groups and replay checks passed`)
}
