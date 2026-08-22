export function normalizeMigrationDate(
  value: string | null | undefined,
): string | null {
  if (!value || /^\d{4}-0-/.test(value)) return null
  const normalized = value.replace(' ', 'T').replace(/(\.\d{3})\d*$/, '$1')
  const date = new Date(normalized)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}
