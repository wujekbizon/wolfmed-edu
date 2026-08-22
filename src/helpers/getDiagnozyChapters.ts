import { compareDiagnozySection } from '@/helpers/compareDiagnozySection'
import type { DiagnozaListItem, DiagnozyChapterOption } from '@/types/diagnozyTypes'

export function getDiagnozyChapters(items: DiagnozaListItem[]): DiagnozyChapterOption[] {
  const titleByNumber = new Map<string, string>()

  for (const item of items) {
    if (!titleByNumber.has(item.chapterNumber)) {
      titleByNumber.set(item.chapterNumber, item.chapterTitle)
    }
  }

  return [...titleByNumber.entries()]
    .map(([number, title]) => ({ number, title }))
    .sort((a, b) => compareDiagnozySection(a.number, b.number))
}
