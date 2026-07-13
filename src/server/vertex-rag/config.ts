import 'server-only'
import { PROJECT_ID, LOCATION, getAccessToken } from './client'

// RagEngineConfig lives on the v1beta1 surface (the deployment-mode / Serverless
// feature is Public Preview). client.vertexFetch is pinned to v1, so this module
// talks to v1beta1 directly.
const CONFIG_RESOURCE = `projects/${PROJECT_ID}/locations/${LOCATION}/ragEngineConfig`

async function ragEngineConfigFetch(pathSuffix: string, options: RequestInit = {}) {
  const token = await getAccessToken()
  const url = `https://${LOCATION}-aiplatform.googleapis.com/v1beta1/${CONFIG_RESOURCE}${pathSuffix}`
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })
  if (!res.ok) {
    const errBody = await res.text()
    throw new Error(`RagEngineConfig API error (${res.status}): ${errBody}`)
  }
  return res.json()
}

// Reads the project-level RAG Engine config. This is the safe, non-mutating call
// that the Phase 2 pre-flight runs FIRST to record current state (expected:
// Spanner / Basic) and to confirm the exact field shape before any PATCH — the
// Preview API's precise field names are best verified against a live response.
export async function getRagEngineConfig(): Promise<Record<string, unknown>> {
  return ragEngineConfigFetch('')
}

// Generic PATCH with an explicit update mask, then a mandatory read-back. The
// guide's warning is real: a silently-failed mode switch lands the next corpus
// in the wrong backend. Every mutation here verifies by re-reading.
// UpdateRagEngineConfig has no update_mask (verified: a masked PATCH 400s with
// "Field 'updateMask' could not be found in request message") — it's a
// full-resource PATCH.
export async function patchRagEngineConfig(
  patch: Record<string, unknown>
): Promise<Record<string, unknown>> {
  await ragEngineConfigFetch('', {
    method: 'PATCH',
    body: JSON.stringify({ name: CONFIG_RESOURCE, ...patch }),
  })
  // Read-back: the returned config is the source of truth, not the PATCH echo.
  return getRagEngineConfig()
}

export type RagManagedDbTier = 'BASIC' | 'SCALED' | 'UNPROVISIONED'
export type DeploymentMode = 'SPANNER' | 'SERVERLESS'

// Verified against a live GET (2026-07): the config shape is
//   ragManagedDbConfig: { spanner: { basic|scaled|unprovisioned: {} } }
// for Spanner mode, and the sibling `serverless: {}` for Serverless mode. The
// tier only applies to Spanner. All writes read back — a silently-failed switch
// otherwise lands the next corpus in the wrong backend.
function tierKey(tier: RagManagedDbTier): 'basic' | 'scaled' | 'unprovisioned' {
  return tier === 'SCALED' ? 'scaled' : tier === 'UNPROVISIONED' ? 'unprovisioned' : 'basic'
}

// Switches the project-level deployment mode. SPANNER carries a tier; SERVERLESS
// takes none. Data does NOT migrate between modes — after switching, corpora
// created in the other mode are hidden (but retained). Reversible by switching
// back, EXCEPT the UNPROVISIONED tier (see below).
export async function setDeploymentMode(
  mode: DeploymentMode,
  tier: RagManagedDbTier = 'BASIC',
  confirmIrreversible = false
): Promise<Record<string, unknown>> {
  if (mode === 'SPANNER' && tier === 'UNPROVISIONED' && !confirmIrreversible) {
    throw new Error(
      'UNPROVISIONED is irreversible (deletes the Spanner instance and all corpora). ' +
        'Pass confirmIrreversible=true to proceed — operator action only.'
    )
  }

  const ragManagedDbConfig =
    mode === 'SERVERLESS' ? { serverless: {} } : { spanner: { [tierKey(tier)]: {} } }

  return patchRagEngineConfig({ ragManagedDbConfig })
}

// Convenience: change the Spanner tier without leaving Spanner mode.
export async function setRagManagedDbTier(
  tier: RagManagedDbTier,
  confirmIrreversible = false
): Promise<Record<string, unknown>> {
  return setDeploymentMode('SPANNER', tier, confirmIrreversible)
}
