/**
 * RAG Phase 2 pre-flight (READ-ONLY — mutates nothing).
 * Run with: pnpm run rag:preflight
 *
 * Fetches the project-level RagEngineConfig so we can (a) record the current
 * deployment mode + tier before migrating, and (b) confirm the EXACT Preview API
 * field shape before writing any deployment-mode PATCH. Uses your local ADC
 * (`gcloud auth application-default login`) against the configured project.
 */

import 'dotenv/config'
import { getRagEngineConfig } from '../src/server/vertex-rag/config'
import { PROJECT_ID, LOCATION } from '../src/server/vertex-rag/client'

async function preflight() {
  console.log(`Project:  ${PROJECT_ID}`)
  console.log(`Location: ${LOCATION}`)
  console.log('Fetching RagEngineConfig (read-only)...\n')

  try {
    const config = await getRagEngineConfig()
    console.log('RagEngineConfig:')
    console.log(JSON.stringify(config, null, 2))
    console.log(
      '\nExpected: Spanner-mode / Basic tier (100 processing units).\n' +
        'Paste this whole block back so the exact field names can be confirmed\n' +
        'before writing the deployment-mode switch.'
    )
  } catch (error) {
    console.error('\nRagEngineConfig GET failed:')
    console.error(error instanceof Error ? error.message : error)
    console.error(
      '\nA 404 here usually means the project has never set a deployment mode\n' +
        '(still the implicit Spanner default). Any 401/403 means ADC lacks access —\n' +
        'run `gcloud auth application-default login` with the right project.'
    )
    process.exit(1)
  }
}

preflight()
