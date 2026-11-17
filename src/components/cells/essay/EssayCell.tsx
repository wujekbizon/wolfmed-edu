'use client'

import { useEffect, useRef } from 'react'
import { FilePenLine } from 'lucide-react'
import { useEssayCell } from '@/hooks/useEssayCell'
import { useCellsStore } from '@/store/useCellsStore'
import { ESSAY_TABS } from '@/constants/essay'
import TabNavigation from '@/components/ui/TabNavigation'
import TabPanel from '@/components/ui/TabPanel'
import EssayBriefForm from './EssayBriefForm'
import EssayPlan from './EssayPlan'
import EssayText from './EssayText'
import type { EssayCellProps } from '@/types/essayUiTypes'
import type { EssayStep } from '@/types/essayTypes'

export default function EssayCell({ cell }: EssayCellProps) {
  const { draft, step, setStep, update, applyResult } = useEssayCell(cell)
  const dirty = useCellsStore((state) => state.dirty)
  const saving = useCellsStore((state) => state.saving)
  const heading = useRef<HTMLHeadingElement>(null)
  const previousStep = useRef(step)
  useEffect(() => {
    if (previousStep.current !== step) heading.current?.focus()
    previousStep.current = step
  }, [step])
  if (!draft) return <p role="alert" className="rounded-lg bg-white p-5 text-sm text-red-600">Nie udało się odczytać szkicu. Zachowano jego dane. Przywróć poprawną wersję przez synchronizację planszy.</p>
  const id = `essay-${cell.id}`
  return (
    <div className="h-full min-h-0 overflow-y-auto rounded-xl border border-zinc-200 bg-white p-4 sm:p-6">
      <div className="mx-auto max-w-3xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 ref={heading} tabIndex={-1} className="flex items-center gap-2 text-lg font-semibold text-zinc-800 outline-none"><FilePenLine className="size-5 text-rose-400" />Praca pisemna</h2>
          <span aria-live="polite" className="text-xs text-zinc-500">{saving ? 'Zapisywanie planszy...' : dirty ? 'Niezapisane zmiany na planszy' : 'Plansza zapisana'}</span>
        </div>
        <TabNavigation id={id} label="Etapy pracy" options={ESSAY_TABS} active={step} onChange={(value) => setStep(value as EssayStep)} variant="underline" />
        <TabPanel id={id} tabId="brief" active={step === 'brief'}>
          <EssayBriefForm cellId={cell.id} input={cell.content} draft={draft} onChange={(brief) => update({ brief })} onResult={applyResult} />
        </TabPanel>
        <TabPanel id={id} tabId="plan" active={step === 'plan'}>
          <EssayPlan input={cell.content} draft={draft} onChange={(sections) => update({ sections, targetWords: sections.reduce((sum, section) => sum + section.words, 0) })} onResult={applyResult} onBack={() => setStep('brief')} />
        </TabPanel>
        <TabPanel id={id} tabId="text" active={step === 'text'}>
          {step === 'text' && <EssayText draft={draft} onChange={(editorContent) => update({ editorContent })} />}
        </TabPanel>
      </div>
    </div>
  )
}
