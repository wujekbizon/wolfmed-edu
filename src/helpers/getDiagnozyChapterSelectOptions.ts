import { DIAGNOZY_ALL_CHAPTERS_LABEL } from '@/constants/diagnozyBrowse'
import type { DiagnozyChapterOption } from '@/types/diagnozyTypes'
import type { SelectOption } from '@/types/uiTypes'

export function getDiagnozyChapterSelectOptions(
  chapters: DiagnozyChapterOption[]
): SelectOption[] {
  return [
    { value: '', label: DIAGNOZY_ALL_CHAPTERS_LABEL },
    ...chapters.map((chapter) => ({
      value: chapter.number,
      label: `${chapter.number}. ${chapter.title || `Rozdział ${chapter.number}`}`,
    })),
  ]
}
