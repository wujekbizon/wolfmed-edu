import { toWolfekCsvCell } from './toWolfekCsvCell'

export function buildWolfekCsv(rows: Record<string, unknown>[], columns: string[]): string {
  return '\uFEFF' + [columns.map(toWolfekCsvCell).join(','),
    ...rows.map((row) => columns.map((column) => toWolfekCsvCell(row[column])).join(','))].join('\r\n')
}
