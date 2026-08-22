import 'server-only'

// Maps Google API errors to user-facing Polish messages. Distinguishes quota
// (429) and outage (503) from other failures — an overloaded/unavailable service
// must not look like missing content (plan §10.2). @google/genai ApiError may
// carry a numeric `status`; the body is often JSON in error.message.
export function parseGoogleApiError(error: unknown): Error {
  if (!(error instanceof Error)) return new Error('Wystąpił nieznany błąd')

  const statusField = (error as { status?: unknown }).status
  let code: number | undefined = typeof statusField === 'number' ? statusField : undefined
  let googleStatus: string | undefined
  let message = error.message

  try {
    const parsed = JSON.parse(error.message)
    if (parsed.error) {
      code = typeof parsed.error.code === 'number' ? parsed.error.code : code
      googleStatus = parsed.error.status
      message = parsed.error.message ?? message
    }
  } catch {
    /* message wasn't JSON — keep it as-is */
  }

  if (code === 429 || googleStatus === 'RESOURCE_EXHAUSTED') {
    return new Error('Baza wiedzy jest chwilowo przeciążona (wyczerpano limit zapytań). Spróbuj ponownie za chwilę.')
  }
  if (code === 503 || googleStatus === 'UNAVAILABLE') {
    return new Error('Baza wiedzy jest chwilowo niedostępna. Spróbuj ponownie za chwilę.')
  }
  return new Error(message)
}
