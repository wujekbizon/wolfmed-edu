import { startTransition, useEffect, useRef, type RefObject } from 'react'
import { useRagStore } from '@/store/useRagStore'
import { useSettingsStore } from '@/store/useSettingsStore'

interface UseRagAutoSubmitArgs {
  cellId: string
  topic: string
  searchTopic?: string | undefined
  textareaRef: RefObject<HTMLTextAreaElement | null>
  onSubmit: (formData: FormData) => void
}

/** Submits the cell's topic on its own once the learning hub or a mind map spawned it. */
export function useRagAutoSubmit({
  cellId,
  topic,
  searchTopic,
  textareaRef,
  onSubmit,
}: UseRagAutoSubmitArgs) {
  const { pendingAutoSubmitCellId, setPendingAutoSubmitCellId } = useRagStore()
  const slashCommandsEnabled = useSettingsStore((s) => s.slashCommandsEnabled)
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
    if (searchTopic) formData.set('searchTopic', searchTopic)
    // This path composes its own FormData, so the setting has to be repeated here
    // or a slash typed into the side input would still run with commands off.
    formData.set('commandsEnabled', String(slashCommandsEnabled))
    startTransition(() => submitRef.current(formData))
  }, [
    pendingAutoSubmitCellId,
    cellId,
    topic,
    searchTopic,
    slashCommandsEnabled,
    setPendingAutoSubmitCellId,
    textareaRef,
  ])
}
