import { startTransition, useEffect, useRef, type RefObject } from 'react'
import { useRagStore } from '@/store/useRagStore'

interface UseRagAutoSubmitArgs {
  cellId: string
  topic: string
  textareaRef: RefObject<HTMLTextAreaElement | null>
  onSubmit: (formData: FormData) => void
}

/** Submits the cell's topic on its own once the learning hub or a mind map spawned it. */
export function useRagAutoSubmit({ cellId, topic, textareaRef, onSubmit }: UseRagAutoSubmitArgs) {
  const { pendingAutoSubmitCellId, setPendingAutoSubmitCellId } = useRagStore()
  const submitRef = useRef(onSubmit)
  submitRef.current = onSubmit

  useEffect(() => {
    if (pendingAutoSubmitCellId !== cellId) return

    setPendingAutoSubmitCellId(null)
    document.getElementById(`cell-${cellId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

    if (!topic) return
    if (textareaRef.current) {
      textareaRef.current.value = topic
    }

    const formData = new FormData()
    formData.set('question', topic)
    formData.set('cellId', cellId)
    startTransition(() => submitRef.current(formData))
  }, [pendingAutoSubmitCellId, cellId, topic, setPendingAutoSubmitCellId, textareaRef])
}
