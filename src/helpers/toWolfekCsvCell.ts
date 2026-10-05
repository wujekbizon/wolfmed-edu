export function toWolfekCsvCell(value: unknown): string {
  let text = value === null || value === undefined ? '' :
    value instanceof Date ? value.toISOString() : typeof value === 'object' ? JSON.stringify(value) : String(value)
  if (/^\s*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text = `'${text}`
  return `"${text.replaceAll('"', '""')}"`
}
