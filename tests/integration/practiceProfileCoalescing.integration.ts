import { compareProfileProjection } from './support/compareProfileProjection'
import { verifyProfileCoalescingSafety } from './support/verifyProfileCoalescingSafety'

for (const scenario of ['single', 'burst', 'sequential', 'already-current'] as const) {
  await compareProfileProjection(scenario)
}
await verifyProfileCoalescingSafety()
console.log('Application profile coalescing regression: PASS; SQL/persistence mocked')
