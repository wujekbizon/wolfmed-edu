import type { DiagnozaListItem, DiagnozyChapter } from '@/types/diagnozyTypes'

// Groups a section-ordered list into chapters, preserving order of appearance
export function groupDiagnozyByChapter(items: DiagnozaListItem[]): DiagnozyChapter[] {
  const chapters: DiagnozyChapter[] = []
  for (const item of items) {
    const last = chapters[chapters.length - 1]
    if (last && last.number === item.chapterNumber) {
      last.diagnozy.push(item)
    } else {
      chapters.push({
        number: item.chapterNumber,
        title: item.chapterTitle,
        diagnozy: [item],
      })
    }
  }
  return chapters
}
