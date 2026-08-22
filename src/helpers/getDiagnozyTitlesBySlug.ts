import type { DiagnozaTitleRow } from '@/types/diagnozyTypes'

export function getDiagnozyTitlesBySlug(rows: DiagnozaTitleRow[]): Record<string, string> {
  return Object.fromEntries(rows.map((row) => [row.slug, `${row.section} ${row.title}`]))
}
