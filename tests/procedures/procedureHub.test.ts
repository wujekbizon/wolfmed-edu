import assert from 'node:assert/strict'
import test from 'node:test'
import { getProcedureHubCards } from '@/helpers/getProcedureHubCards'

test('both courses default to Opiekun regardless of enrollment order', () => {
  const cards = getProcedureHubCards([{ slug: 'pielegniarstwo' }, { slug: 'opiekun-medyczny' }])
  assert.deepEqual(cards.map(card => card.slug), ['opiekun-medyczny', 'pielegniarstwo'])
  assert.deepEqual(cards.map(card => card.href), [
    '/panel/procedury/opiekun-medyczny', '/panel/procedury/pielegniarstwo',
  ])
})

test('single enrollment exposes only its own panel and destination', () => {
  for (const slug of ['opiekun-medyczny', 'pielegniarstwo']) {
    const cards = getProcedureHubCards([{ slug }])
    assert.equal(cards.length, 1)
    assert.equal(cards[0]?.slug, slug)
    assert.equal(cards[0]?.href, `/panel/procedury/${slug}`)
  }
})

test('no eligible enrollment produces an empty hub', () => {
  assert.deepEqual(getProcedureHubCards([]), [])
  assert.deepEqual(getProcedureHubCards([{ slug: 'angielski-medyczny' }]), [])
})
