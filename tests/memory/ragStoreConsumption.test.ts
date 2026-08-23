import test from 'node:test'
import assert from 'node:assert/strict'
import { useRagStore } from '@/store/useRagStore'

test('consumes a pending SideMenu topic exactly once', () => {
  const store = useRagStore.getState()
  store.setPendingTopic('Jak mi idzie?')

  assert.equal(useRagStore.getState().consumePendingTopic(), 'Jak mi idzie?')
  assert.equal(useRagStore.getState().consumePendingTopic(), null)
})

test('consumes auto-submit only for its target cell and only once', () => {
  const store = useRagStore.getState()
  store.setPendingAutoSubmitCellId('cell-1')

  assert.equal(useRagStore.getState().consumePendingAutoSubmit('cell-2'), false)
  assert.equal(useRagStore.getState().consumePendingAutoSubmit('cell-1'), true)
  assert.equal(useRagStore.getState().consumePendingAutoSubmit('cell-1'), false)
})
