'use client'

import { useState, useTransition } from 'react'
import { generateLectureAction } from '@/actions/rag-actions'
import { showToast } from '@/hooks/useToastMessage'
import { useCellsStore } from '@/store/useCellsStore'
import type { Cell, MediaCellContent } from '@/types/cellTypes'
import type { GeneratedLecture } from '@/types/lectureTypes'

export function useLectureGeneration(cell: Cell) {
  const [isPending, startTransition] = useTransition()
  const [generatedLecture, setGeneratedLecture] = useState<GeneratedLecture | null>(null)
  const insertCellAfterWithContent = useCellsStore((state) => state.insertCellAfterWithContent)

  const generate = () => {
    startTransition(async () => {
      const result = await generateLectureAction(cell.content)
      if (result.status === 'SUCCESS') {
        const lecture = result.values as unknown as GeneratedLecture
        const mediaContent: MediaCellContent = {
          sourceType: 'audio', title: `Wykład: ${lecture.title}`, url: lecture.audioUrl,
          lectureId: lecture.lectureId, transcript: lecture.transcript,
        }
        insertCellAfterWithContent(cell.id, 'media', JSON.stringify(mediaContent))
        setGeneratedLecture(lecture)
        showToast('SUCCESS', 'Wykład gotowy!')
      } else {
        showToast('ERROR', result.message || 'Nie udało się wygenerować wykładu.')
      }
    })
  }

  const saveScript = () => {
    if (!generatedLecture) return
    insertCellAfterWithContent(cell.id, 'note', generatedLecture.transcript)
    showToast('SUCCESS', 'Skrypt zapisany jako notatka.')
  }

  return { isPending, generatedLecture, generate, saveScript }
}
