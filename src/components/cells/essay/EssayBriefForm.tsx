'use client'

import { useActionState, useId } from 'react'
import { ArrowRight, LoaderCircle } from 'lucide-react'
import { prepareEssayOutlineAction } from '@/actions/essay-outline'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { useToastMessage } from '@/hooks/useToastMessage'
import { useEssayActionResult } from '@/hooks/useEssayActionResult'
import { useEssayResources } from '@/context/EssayResourcesContext'
import Button from '@/components/ui/Button'
import FieldError from '@/components/FieldError'
import EssayBriefFields from './EssayBriefFields'
import EssayMaterials from './EssayMaterials'
import type { EssayBriefFormProps } from '@/types/essayUiTypes'

export default function EssayBriefForm({ draft, onChange, onResult, cellId, input }: EssayBriefFormProps) {
  const [state, action, pending] = useActionState(prepareEssayOutlineAction, EMPTY_FORM_STATE)
  const fallback = useToastMessage(state)
  const id = useId()
  const { courses } = useEssayResources()
  useEssayActionResult(state, onResult)
  return (
    <div className="space-y-5">
      <form id={id} action={action}>
        <input type="hidden" name="brief" value={JSON.stringify(draft.brief)} />
        <input type="hidden" name="input" value={input} />
        <EssayBriefFields brief={draft.brief} onChange={onChange} state={state} disabled={pending} id={id} />
        <FieldError name="materialIds" formState={state} />
        {fallback}
      </form>
      <EssayMaterials cellId={cellId} brief={draft.brief} onChange={onChange} />
      {!courses.length && <p className="text-sm text-zinc-600">Generowanie pracy wymaga Premium dla Pielęgniarstwa lub Opiekuna medycznego.</p>}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-zinc-200 pt-4">
        <p className="max-w-64 text-xs text-zinc-500">Długość dobierzemy do tematu i dostępnych materiałów.</p>
        <Button type="submit" form={id} disabled={pending || !courses.length} size="md">
          {pending ? <><LoaderCircle className="size-4 animate-spin" />Przygotowywanie...</> : <>Przygotuj plan<ArrowRight className="size-4" /></>}
        </Button>
      </div>
    </div>
  )
}
