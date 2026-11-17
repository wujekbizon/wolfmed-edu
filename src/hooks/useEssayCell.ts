'use client'

import { useCallback, useMemo, useState } from 'react'
import { useCellsStore } from '@/store/useCellsStore'
import { useEssayResources } from '@/context/EssayResourcesContext'
import { parseEssayCellContent } from '@/helpers/parseEssayCellContent'
import { showToast } from '@/hooks/useToastMessage'
import type { Cell } from '@/types/cellTypes'
import type { EssayDraft, EssayStep } from '@/types/essayTypes'

export function useEssayCell(cell: Cell) {
  const { courses } = useEssayResources()
  const draft = useMemo(() => {
    const parsed = parseEssayCellContent(cell.content)
    if (parsed && !parsed.brief.course) parsed.brief.course = courses[0] ?? ''
    return parsed
  }, [cell.content, courses])
  const [step, setStep] = useState<EssayStep>(() => draft?.editorContent ? 'text' : draft?.sections.length ? 'plan' : 'brief')
  const update = useCallback((changes: Partial<EssayDraft>) => {
    const store = useCellsStore.getState()
    const current = store.data[cell.id]
    const value = current ? parseEssayCellContent(current.content) : null
    if (!value) return
    if (!value.brief.course) value.brief.course = courses[0] ?? ''
    store.updateCell(cell.id, JSON.stringify({ ...value, ...changes }))
  }, [cell.id, courses])
  const applyResult = useCallback((input: string, result: EssayDraft) => {
    const store = useCellsStore.getState()
    const current = store.data[cell.id]
    if (!current || current.content !== input) {
      showToast('ERROR', 'Szkic zmienił się podczas generowania. Zachowaliśmy Twoje zmiany. Spróbuj ponownie.')
      return
    }
    const previous = parseEssayCellContent(current.content)
    if (!previous) return
    const next = result.documentId ? result : {
      ...result, editorContent: previous.editorContent, documentId: previous.documentId,
      documentTopic: previous.documentTopic, sources: previous.sources,
    }
    store.updateCell(cell.id, JSON.stringify(next))
    setStep(result.gaps.length || !result.documentId ? 'plan' : 'text')
  }, [cell.id])
  return { draft, step, setStep, update, applyResult }
}
