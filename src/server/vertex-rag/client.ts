import 'server-only'
import { GoogleGenAI } from '@google/genai'
import { GoogleAuth } from 'google-auth-library'

// Single source of truth for the Vertex AI project + region. Falls back to the
// historical hardcoded values so nothing breaks if the env vars are unset.
export const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT ?? 'project-9d10f80c-d5df-459f-8d8'
export const LOCATION = process.env.GOOGLE_CLOUD_LOCATION ?? 'europe-west3'

const SCOPES = ['https://www.googleapis.com/auth/cloud-platform']

type ServiceAccountCredentials = { client_email: string; private_key: string }

// Vertex AI RAG Engine is IAM-gated (OAuth2 only — no API-key path). Locally we
// rely on ADC from the gcloud login. On serverless hosts (Vercel) there is no
// metadata server, so we feed ADC an explicit service-account key supplied via
// GOOGLE_SERVICE_ACCOUNT_KEY (base64-encoded JSON preferred — the raw JSON's
// private_key newlines get mangled by most env-var stores). Returns undefined
// when unset so GoogleAuth transparently falls back to ADC.
let cachedCredentials: ServiceAccountCredentials | null | undefined
function getCredentials(): ServiceAccountCredentials | undefined {
  if (cachedCredentials !== undefined) return cachedCredentials ?? undefined

  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.trim()
  if (!raw) {
    cachedCredentials = null
    return undefined
  }

  try {
    const json = raw.startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf-8')
    const parsed = JSON.parse(json)
    if (!parsed.client_email || !parsed.private_key) {
      throw new Error('missing client_email or private_key')
    }
    cachedCredentials = {
      client_email: parsed.client_email,
      private_key: parsed.private_key,
    }
    return cachedCredentials
  } catch (error) {
    console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY:', error)
    cachedCredentials = null
    return undefined
  }
}

// Build GoogleAuth options, omitting `credentials` entirely when running on ADC
// (exactOptionalPropertyTypes forbids passing an explicit `undefined`).
function buildAuthOptions() {
  const credentials = getCredentials()
  return credentials
    ? { scopes: SCOPES, projectId: PROJECT_ID, credentials }
    : { scopes: SCOPES, projectId: PROJECT_ID }
}

let auth: GoogleAuth | null = null
function getAuthClient(): GoogleAuth {
  if (!auth) {
    auth = new GoogleAuth(buildAuthOptions())
  }
  return auth
}

export async function getAccessToken(): Promise<string> {
  const client = await getAuthClient().getClient()
  const tokenResponse = await client.getAccessToken()
  if (!tokenResponse.token) {
    throw new Error('Failed to obtain access token from ADC')
  }
  return tokenResponse.token
}

// Shared @google/genai client in Vertex mode. Same credential resolution as the
// REST helpers so both surfaces authenticate identically in every environment.
export function getGoogleAI(): GoogleGenAI {
  return new GoogleGenAI({
    vertexai: true,
    project: PROJECT_ID,
    location: LOCATION,
    googleAuthOptions: buildAuthOptions(),
  })
}

// Small helper so every REST call to Vertex AI doesn't repeat auth boilerplate.
export async function vertexFetch(path: string, options: RequestInit = {}) {
  const token = await getAccessToken()
  const url = `https://${LOCATION}-aiplatform.googleapis.com/v1/${path}`
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
    throw new Error(`Vertex AI API error (${res.status}): ${errBody}`)
  }
  return res.json()
}

// Vertex AI RAG Engine file upload uses a *different* base path (upload/v1, not
// v1) and requires a multipart body (metadata JSON part + raw file bytes part).
export async function vertexUploadFetch(
  path: string,
  metadata: Record<string, unknown>,
  fileBuffer: Buffer,
  mimeType: string,
  fileName: string
) {
  const token = await getAccessToken()
  const boundary = `rag_upload_${Date.now()}_${Math.random().toString(36).slice(2)}`
  const url = `https://${LOCATION}-aiplatform.googleapis.com/upload/v1/${path}`

  const metadataPart =
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="metadata"\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(metadata)}\r\n`

  const filePartHeader =
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n` +
    `Content-Type: ${mimeType}\r\n\r\n`

  const closing = `\r\n--${boundary}--`

  const body = Buffer.concat([
    Buffer.from(metadataPart, 'utf-8'),
    Buffer.from(filePartHeader, 'utf-8'),
    fileBuffer,
    Buffer.from(closing, 'utf-8'),
  ])

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'X-Goog-Upload-Protocol': 'multipart',
    },
    body,
  })

  if (!res.ok) {
    const errBody = await res.text()
    throw new Error(`Vertex AI upload error (${res.status}): ${errBody}`)
  }
  return res.json()
}

// Logs token usage (prompt / candidates / thoughts) for a Gemini call when
// RAG_DEBUG_USAGE=true, so real numbers can replace the cost estimates.
export function logUsage(label: string, response: { usageMetadata?: unknown }): void {
  if (process.env.RAG_DEBUG_USAGE !== 'true') return
  console.log(`[RAG usage] ${label}:`, JSON.stringify(response.usageMetadata ?? {}, null, 2))
}
