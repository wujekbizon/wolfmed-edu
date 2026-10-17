export const WOLFEK_REPORT_TIME_ZONE = 'Europe/Warsaw'
export const WOLFEK_ADMIN_PAGE_SIZE = 25
export const WOLFEK_EXPORT_LIMIT = 5000
export const WOLFEK_ADMIN_STALE_TIME = 30_000
export const WOLFEK_EXPORT_MAX_BYTES = 16_000_000
export const WOLFEK_PRIVATE_HEADERS = { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' }
export const WOLFEK_ADMIN_VIEWS = [
  { value: 'insights', label: 'Insights', description: 'Pytania, potrzeby i zachowanie użytkowników' },
  { value: 'audit', label: 'Audit logs', description: 'Pełne zapytania i odpowiedzi Jev' },
  { value: 'errors', label: 'Errors', description: 'Błędy dostawcy, timeouty i nieprawidłowe odpowiedzi' },
  { value: 'usage', label: 'Usage', description: 'Wywołania i tokeny z odpowiedzi TypeSafe' },
] as const
export const WOLFEK_SOURCE_OPTIONS = [
  { value: 'all', label: 'Wszystkie miejsca' }, { value: 'panel', label: 'Dashboard' },
  { value: 'kierunki', label: 'Kierunki' }, { value: 'practice', label: 'Ćwiczenia' },
]
export const WOLFEK_STATUS_OPTIONS = [
  { value: 'all', label: 'Wszystkie statusy' }, { value: 'success', label: 'Poprawna odpowiedź' },
  { value: 'http_error', label: 'Błąd HTTP' }, { value: 'invalid_response', label: 'Nieprawidłowa odpowiedź' },
  { value: 'timeout', label: 'Timeout' }, { value: 'error', label: 'Błąd połączenia' },
]
