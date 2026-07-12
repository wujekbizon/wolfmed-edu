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
export async function patchRagEngineConfig(
  patch: Record<string, unknown>,
  updateMask: string
): Promise<Record<string, unknown>> {
  await ragEngineConfigFetch(`?updateMask=${encodeURIComponent(updateMask)}`, {
    method: 'PATCH',
    body: JSON.stringify({ name: CONFIG_RESOURCE, ...patch }),
  })
  // Read-back: the returned config is the source of truth, not the PATCH echo.
  return getRagEngineConfig()
}

export type RagManagedDbTier = 'BASIC' | 'SCALED' | 'UNPROVISIONED'

// Sets the RagManagedDb (Spanner) tier. UNPROVISIONED deletes the Spanner
// instance AND every corpus in it, irreversibly — it is the "stop billing"
// switch and the last step of decommissioning. It is guarded behind an explicit
// confirmation argument and is never wired to any UI, per the plan.
export async function setRagManagedDbTier(
  tier: RagManagedDbTier,
  confirmIrreversible = false
): Promise<Record<string, unknown>> {
  if (tier === 'UNPROVISIONED' && !confirmIrreversible) {
    throw new Error(
      'UNPROVISIONED is irreversible (deletes the Spanner instance and all corpora). ' +
        'Pass confirmIrreversible=true to proceed — operator action only.'
    )
  }

  const tierKey = tier === 'SCALED' ? 'scaled' : tier === 'UNPROVISIONED' ? 'unprovisioned' : 'basic'
  return patchRagEngineConfig(
    { ragManagedDbConfig: { [tierKey]: {} } },
    'ragManagedDbConfig'
  )
}
