import assert from 'node:assert/strict'
import test, { after } from 'node:test'
import { registerHooks } from 'node:module'
import { getDefaultWolfekAdminFilters } from '@/helpers/getDefaultWolfekAdminFilters'

const state = { reports: 0 }
const registry = globalThis as typeof globalThis & { wolfekAdminValidationTest?: typeof state }
registry.wolfekAdminValidationTest = state
const replacements: Record<string, string> = {
  '@/helpers/requireAdmin': 'export async function requireAdmin() { return { userId: "admin" } }',
  '@/lib/rateLimit': 'export async function checkRateLimit() { return { success: true } }',
  '@/server/db/index': 'export const db = {}',
  '@/server/db/schema': 'export const jevAuditLogs = {}',
  '@/server/wolfek-admin/getWolfekAdminReport': `export async function getWolfekAdminReport() {
    globalThis.wolfekAdminValidationTest.reports++; return { rows: [] }
  }`,
}
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    const source = replacements[specifier]
    return source ? { url: `data:text/javascript,${encodeURIComponent(source)}`, shortCircuit: true }
      : nextResolve(specifier, context)
  },
})
const { getAdminWolfekReportAction } = await import('@/actions/wolfek-admin')
after(() => { hooks.deregister(); delete registry.wolfekAdminValidationTest })

test('invalid dates return a field error instead of throwing or querying reports; corrected dates recover', async () => {
  const defaults = getDefaultWolfekAdminFilters()
  const invalid = await getAdminWolfekReportAction({ ...defaults, from: '2026-10-19', to: '2026-10-18' })
  assert.equal(invalid.report, null)
  assert.equal(invalid.formState.status, 'ERROR')
  assert.equal(invalid.formState.message, '')
  assert.match(invalid.formState.fieldErrors.to?.[0] ?? '', /wcześniejsza/)
  assert.equal(state.reports, 0)
  const corrected = await getAdminWolfekReportAction({ ...defaults, from: '2026-10-18', to: '2026-10-18' })
  assert.equal(corrected.formState.status, 'SUCCESS')
  assert.ok(corrected.report)
  assert.equal(state.reports, 1)
})
