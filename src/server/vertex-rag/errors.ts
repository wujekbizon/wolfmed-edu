import 'server-only'

// Google API errors often arrive as a JSON string in error.message. Unwrap the
// human-readable message when present; otherwise pass the error through.
export function parseGoogleApiError(error: unknown): Error {
  if (error instanceof Error) {
    try {
      const parsed = JSON.parse(error.message)
      if (parsed.error?.message) {
        return new Error(parsed.error.message)
      }
    } catch {
      return error
    }
    return error
  }
  return new Error('Wystąpił nieznany błąd')
}
