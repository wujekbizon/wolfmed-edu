/**
 * RAG Phase 2 — deployment-mode switch (Spanner <-> Serverless).
 * Run with:
 *   pnpm run rag:migrate status       # read-only, print current config
 *   pnpm run rag:migrate serverless   # switch to Serverless mode
 *   pnpm run rag:migrate spanner      # switch back to Spanner/Basic (rollback)
 *
 * Standalone (no app imports — they are server-only, which throws under tsx).
 * Every switch reads back and verifies. Switching modes does NOT migrate data:
 * after switching you create a fresh corpus and re-upload. Reversible by
 * switching back. This tool never touches the irreversible UNPROVISIONED tier.
 */

import 'dotenv/config'
import { GoogleAuth } from 'google-auth-library'

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT ?? 'project-9d10f80c-d5df-459f-8d8'
const LOCATION = process.env.GOOGLE_CLOUD_LOCATION ?? 'europe-west3'
const SCOPES = ['https://www.googleapis.com/auth/cloud-platform']
const BASE = `https://${LOCATION}-aiplatform.googleapis.com/v1beta1/projects/${PROJECT_ID}/locations/${LOCATION}/ragEngineConfig`

function getCredentials(): { client_email: string; private_key: string } | undefined {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.trim()
  if (!raw) return undefined
  const json = raw.startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf-8')
  const parsed = JSON.parse(json)
  return { client_email: parsed.client_email, private_key: parsed.private_key }
}

async function getToken(): Promise<string> {
  const credentials = getCredentials()
  const auth = new GoogleAuth(
    credentials
      ? { scopes: SCOPES, projectId: PROJECT_ID, credentials }
      : { scopes: SCOPES, projectId: PROJECT_ID }
  )
  const client = await auth.getClient()
  const { token } = await client.getAccessToken()
  if (!token) throw new Error('Failed to obtain access token from ADC')
  return token
}

async function getConfig(token: string): Promise<Record<string, unknown>> {
  const res = await fetch(BASE, { headers: { Authorization: `Bearer ${token}` } })
  const body = await res.text()
  if (!res.ok) throw new Error(`GET ${res.status}: ${body}`)
  return JSON.parse(body)
}

async function patchMode(token: string, ragManagedDbConfig: Record<string, unknown>): Promise<void> {
  const res = await fetch(`${BASE}?updateMask=ragManagedDbConfig`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: `projects/${PROJECT_ID}/locations/${LOCATION}/ragEngineConfig`, ragManagedDbConfig }),
  })
  const body = await res.text()
  if (!res.ok) throw new Error(`PATCH ${res.status}: ${body}`)
}

async function switchMode(target: 'serverless' | 'spanner') {
  const token = await getToken()

  const before = await getConfig(token)
  console.log('Before:')
  console.log(JSON.stringify(before.ragManagedDbConfig ?? before, null, 2))

  const modeBody = target === 'serverless' ? { serverless: {} } : { spanner: { basic: {} } }
  console.log(`\nSwitching to ${target.toUpperCase()}...`)
  await patchMode(token, modeBody)

  const after = await getConfig(token)
  console.log('\nAfter (read-back):')
  console.log(JSON.stringify(after.ragManagedDbConfig ?? after, null, 2))

  const cfg = (after.ragManagedDbConfig ?? {}) as Record<string, unknown>
  const ok = target === 'serverless' ? 'serverless' in cfg : 'spanner' in cfg
  if (!ok) {
    console.error(`\n✗ Read-back does NOT show ${target}. The switch did not take — do not proceed.`)
    process.exit(1)
  }

  console.log(`\n✓ Deployment mode is now ${target.toUpperCase()}.`)
  if (target === 'serverless') {
    console.log(
      'Existing Spanner corpora are now hidden (retained, not deleted).\n' +
        'Next: /admin/rag → Create store (uses gemini-embedding-001) → re-upload your docs.'
    )
  } else {
    console.log('Back on Spanner/Basic. Point ragConfig at the old corpus to complete rollback.')
  }
}

async function main() {
  const cmd = process.argv[2]
  switch (cmd) {
    case 'status': {
      const token = await getToken()
      console.log(JSON.stringify(await getConfig(token), null, 2))
      break
    }
    case 'serverless':
      await switchMode('serverless')
      break
    case 'spanner':
      await switchMode('spanner')
      break
    default:
      console.log('Usage: pnpm run rag:migrate <status|serverless|spanner>')
      process.exit(1)
  }
}

main().catch((err) => {
  console.error('rag:migrate failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
