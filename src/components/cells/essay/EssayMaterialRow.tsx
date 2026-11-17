'use client'

import { useActionState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { prepareEssayMaterialAction } from '@/actions/prepare-essay-material'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { ESSAY_MATERIAL_QUERY } from '@/constants/essay'
import { useToastMessage } from '@/hooks/useToastMessage'
import Checkbox from '@/components/ui/Checkbox'
import Button from '@/components/ui/Button'
import { useMaterialModalStore } from '@/store/useMaterialModalStore'
import SubmitButton from '@/components/SubmitButton'
import FormError from '@/components/FormError'
import type { EssayMaterialRowProps } from '@/types/essayUiTypes'

export default function EssayMaterialRow({ material, course, selected, onToggle }: EssayMaterialRowProps) {
  const [state, action] = useActionState(prepareEssayMaterialAction, EMPTY_FORM_STATE)
  const fallback = useToastMessage(state)
  const queryClient = useQueryClient()
  const { openPdfModal, openTextModal } = useMaterialModalStore()
  useEffect(() => {
    if (state.status === 'SUCCESS') void queryClient.invalidateQueries({ queryKey: [ESSAY_MATERIAL_QUERY] })
  }, [state, queryClient])
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50/50 p-2">
      <Checkbox checked={selected} onChange={onToggle} label={material.title} />
      <div className="px-3 pb-2">
        <Button size="sm" variant="ghost" onClick={() => material.type === 'application/pdf' ? openPdfModal(material.url, material.title) : void openTextModal(material.url, material.title)}>Podgląd</Button>
        <p className="text-xs text-zinc-500">{material.ready ? 'Gotowy do użycia' : material.indexStatus === 'pending' ? 'Przygotowywanie materiału...' : 'Materiał wymaga przygotowania'}</p>
        {!material.ready && material.retryable && (
          <form action={action} className="mt-2 max-w-64">
            <input type="hidden" name="materialId" value={material.id} />
            <input type="hidden" name="course" value={course} />
            <SubmitButton label={material.indexStatus === 'pending' ? 'Ponów przygotowanie' : 'Przygotuj materiał'} loading="Przygotowywanie..." size="sm" variant="secondary" />
            <FormError formState={state} />
            {fallback}
          </form>
        )}
      </div>
    </div>
  )
}
