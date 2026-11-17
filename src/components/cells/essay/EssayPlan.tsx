'use client'

import { useActionState } from 'react'
import { nanoid } from 'nanoid'
import { ArrowLeft, ArrowRight, LoaderCircle, Plus } from 'lucide-react'
import { generateEssayAction } from '@/actions/essay-generate'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { useToastMessage } from '@/hooks/useToastMessage'
import { useEssayActionResult } from '@/hooks/useEssayActionResult'
import Button from '@/components/ui/Button'
import FormError from '@/components/FormError'
import EssaySectionRow from './EssaySectionRow'
import EssaySources from './EssaySources'
import type { EssayPlanFormProps } from '@/types/essayUiTypes'

export default function EssayPlan({ draft, onChange, onResult, onBack, input }: EssayPlanFormProps) {
  const [state, action, pending] = useActionState(generateEssayAction, EMPTY_FORM_STATE)
  const fallback = useToastMessage(state)
  useEssayActionResult(state, onResult)
  const stale = draft.outlineBrief !== JSON.stringify(draft.brief)
  const move = (index: number, offset: number) => {
    const sections = [...draft.sections]
    const [section] = sections.splice(index, 1)
    if (section) sections.splice(index + offset, 0, section)
    onChange(sections)
  }
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="draft" value={JSON.stringify(draft)} />
      <input type="hidden" name="input" value={input} />
      <div><h3 className="text-base font-medium text-zinc-800">{draft.brief.topic || 'Plan pracy'}</h3><p className="mt-1 text-xs text-zinc-500">{draft.targetWords > 0 ? `Proponowana długość około ${draft.targetWords} słów` : 'Najpierw przygotuj plan na podstawie materiałów.'}</p></div>
      {(stale || draft.gaps.length > 0) && (
        <div role="alert" className="space-y-2 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
          {stale ? <p>Wymagania zmieniły się. Przygotuj ponownie plan.</p> : draft.gaps.map((gap, index) => <p key={index}>{gap}</p>)}
          <Button variant="secondary" size="sm" onClick={onBack}>Zmień wymagania lub dodaj materiały</Button>
        </div>
      )}
      <div>{draft.sections.map((section, index) => (
        <EssaySectionRow key={section.id} section={section} index={index} count={draft.sections.length} disabled={pending}
          onChange={(next) => onChange(draft.sections.map((item) => item.id === section.id ? next : item))}
          onMove={(offset) => move(index, offset)} onRemove={() => onChange(draft.sections.filter((item) => item.id !== section.id))} />
      ))}</div>
      <Button variant="ghost" size="sm" disabled={pending} onClick={() => onChange([...draft.sections, { id: nanoid(), title: 'Nowa część', description: '', words: 0 }])}><Plus className="size-4" />Dodaj część</Button>
      <EssaySources sources={draft.outlineSources} />
      <FormError formState={state} />
      {fallback}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 pt-4">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="size-4" />Wróć do wymagań</Button>
        <Button type="submit" disabled={pending || stale || Boolean(draft.gaps.length) || !draft.sections.length}>
          {pending ? <><LoaderCircle className="size-4 animate-spin" />Pisanie i sprawdzanie...</> : <>Zatwierdź i napisz<ArrowRight className="size-4" /></>}
        </Button>
      </div>
    </form>
  )
}
