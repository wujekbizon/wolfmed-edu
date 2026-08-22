'use client'

import { useRef, useActionState } from 'react'
import { CircleCheckBig, Archive } from 'lucide-react'
import { archivePlanAction, completePlanAction } from '@/actions/planner'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { useToastMessage } from '@/hooks/useToastMessage'
import { useConfirmModalStore } from '@/store/useConfirmModalStore'
import type { PlanProgress } from '@/types/plannerTypes'
import FormError from '@/components/FormError'

export default function PlanLifecycleActions({ plan }: { plan: PlanProgress['plan'] }) {
  const [archiveState, archiveAction] = useActionState(archivePlanAction, EMPTY_FORM_STATE)
  const [completeState, completeAction] = useActionState(completePlanAction, EMPTY_FORM_STATE)
  const archiveFallback = useToastMessage(archiveState)
  const completeFallback = useToastMessage(completeState)

  const openConfirmModal = useConfirmModalStore((state) => state.openConfirmModal)
  const archiveFormRef = useRef<HTMLFormElement>(null)
  const completeFormRef = useRef<HTMLFormElement>(null)

  return (
    <div className="flex flex-wrap gap-3 pt-4 border-t border-zinc-200">
      <form action={completeAction} ref={completeFormRef}>
        {completeFallback}
        <input type="hidden" name="planId" value={plan.id} />
        <button
          type="button"
          onClick={() =>
            openConfirmModal({
              title: 'Zakończ plan',
              message: 'Oznaczyć plan jako ukończony? Będziesz mógł utworzyć nowy plan.',
              confirmLabel: 'Zakończ plan',
              onConfirm: () => completeFormRef.current?.requestSubmit(),
            })
          }
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-emerald-200 text-emerald-700 text-sm font-semibold hover:bg-emerald-50 transition-colors"
        >
          <CircleCheckBig className="w-4 h-4" />
          Oznacz jako ukończony
        </button>
        <FormError formState={completeState} />
      </form>

      <form action={archiveAction} ref={archiveFormRef}>
        {archiveFallback}
        <input type="hidden" name="planId" value={plan.id} />
        <button
          type="button"
          onClick={() =>
            openConfirmModal({
              title: 'Archiwizuj plan',
              message: 'Zarchiwizować ten plan? Postęp zostanie zachowany, a Ty będziesz mógł utworzyć nowy plan.',
              confirmLabel: 'Archiwizuj',
              onConfirm: () => archiveFormRef.current?.requestSubmit(),
            })
          }
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-zinc-200 text-zinc-600 text-sm font-semibold hover:bg-zinc-50 transition-colors"
        >
          <Archive className="w-4 h-4" />
          Archiwizuj plan
        </button>
        <FormError formState={archiveState} />
      </form>
    </div>
  )
}
