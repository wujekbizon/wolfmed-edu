/**
 * RAG Phase 2 pre-flight (READ-ONLY — mutates nothing).
 * Run with: pnpm run rag:preflight
 *
 * Fetches the project-level RagEngineConfig so we can (a) record the current
 * deployment mode + tier before migrating, and (b) confirm the EXACT Preview API
 * field shape before writing any deployment-mode PATCH.
 *
 * Standalone by design — imports no app modules (they are server-only, which
 * throws under tsx). Auth mirrors vertex-rag/client: GOOGLE_SERVICE_ACCOUNT_KEY
 * (base64 SA JSON) if set, otherwise local ADC.
 */

import 'dotenv/config'
import { GoogleAuth } from 'google-auth-library'

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT ?? 'project-9d10f80c-d5df-459f-8d8'
const LOCATION = process.env.GOOGLE_CLOUD_LOCATION ?? 'europe-west3'
const SCOPES = ['https://www.googleapis.com/auth/cloud-platform']

function getCredentials(): { client_email: string; private_key: string } | undefined {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.trim()
  if (!raw) return undefined
  const json = raw.startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf-8')
  const parsed = JSON.parse(json)
  return { client_email: parsed.client_email, private_key: parsed.private_key }
}

async function preflight() {
  console.log(`Project:  ${PROJECT_ID}`)
  console.log(`Location: ${LOCATION}`)
  console.log('Fetching RagEngineConfig (read-only)...\n')

  const credentials = getCredentials()
  const auth = new GoogleAuth(
    credentials ? { scopes: SCOPES, projectId: PROJECT_ID, credentials } : { scopes: SCOPES, projectId: PROJECT_ID }
  )
  const client = await auth.getClient()
  const { token } = await client.getAccessToken()
  if (!token) throw new Error('Failed to obtain access token from ADC')

  const url = `https://${LOCATION}-aiplatform.googleapis.com/v1beta1/projects/${PROJECT_ID}/locations/${LOCATION}/ragEngineConfig`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  const body = await res.text()

  if (!res.ok) {
    console.error(`RagEngineConfig GET failed (${res.status}):`)
    console.error(body)
    console.error(
      '\nA 404 usually means the project has never set a deployment mode (still\n' +
        'the implicit Spanner default). 401/403 means ADC/SA lacks access — run\n' +
        '`gcloud auth application-default login` with the right project.'
    )
    process.exit(1)
  }

  console.log('RagEngineConfig:')
  console.log(JSON.stringify(JSON.parse(body), null, 2))
  console.log(
    '\nExpected: Spanner-mode / Basic tier. Paste this whole block back so the\n' +
      'exact field names can be confirmed before writing the mode switch.'
  )
}

preflight().catch((err) => {
  console.error('Pre-flight failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
