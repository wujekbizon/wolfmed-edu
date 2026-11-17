'use client'

import { useActionState, useEffect, useRef } from 'react'
import { Download, LoaderCircle } from 'lucide-react'
import { downloadEssayPdfAction } from '@/actions/essay-download'
import { downloadBrowserFile } from '@/helpers/downloadBrowserFile'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { useToastMessage, showToast } from '@/hooks/useToastMessage'
import Button from '@/components/ui/Button'
import FormError from '@/components/FormError'
import type { EssayDownloadProps } from '@/types/essayUiTypes'

export default function EssayDownload({ draft }: EssayDownloadProps) {
  const [state, action, pending] = useActionState(downloadEssayPdfAction, EMPTY_FORM_STATE)
  const handled = useRef(0)
  const fallback = useToastMessage(state)
  useEffect(() => {
    if (state.status !== 'SUCCESS' || handled.current === state.timestamp) return
    handled.current = state.timestamp
    try {
      const bytes = Uint8Array.from(atob(String(state.values?.pdf ?? '')), (character) => character.charCodeAt(0))
      downloadBrowserFile(new Blob([bytes], { type: 'application/pdf' }), 'praca-pisemna.pdf')
    } catch {
      showToast('ERROR', 'Nie udało się pobrać PDF. Spróbuj ponownie.')
    }
  }, [state])
  return (
    <form action={action}>
      <input type="hidden" name="document" value={JSON.stringify({ topic: draft.documentTopic || draft.brief.topic, editorContent: draft.editorContent, sources: draft.sources })} />
      <Button type="submit" disabled={pending || !draft.editorContent}>{pending ? <LoaderCircle className="size-4 animate-spin" /> : <Download className="size-4" />}{pending ? 'Przygotowywanie PDF...' : 'Pobierz PDF'}</Button>
      <FormError formState={state} />
      {fallback}
    </form>
  )
}
