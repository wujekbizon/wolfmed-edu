'use client'

import { useRef, useState, useActionState } from 'react'
import { Save, CircleCheckBig, Archive } from 'lucide-react'
import {
  archivePlanAction,
  completePlanAction,
  updatePlanAction,
} from '@/actions/planner'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { useToastMessage } from '@/hooks/useToastMessage'
import { useConfirmModalStore } from '@/store/useConfirmModalStore'
import type { PlanProgress } from '@/types/plannerTypes'

const WEEKDAYS = [
  { value: 1, label: 'Pn' },
  { value: 2, label: 'Wt' },
  { value: 3, label: 'Śr' },
  { value: 4, label: 'Cz' },
  { value: 5, label: 'Pt' },
  { value: 6, label: 'So' },
  { value: 7, label: 'Nd' },
]

export default function PlanSettings({ plan }: { plan: PlanProgress['plan'] }) {
  const [studyDays, setStudyDays] = useState<number[]>(plan.studyDays)

  const [updateState, updateFormAction, updatePending] = useActionState(
    updatePlanAction,
    EMPTY_FORM_STATE
  )
  const [archiveState, archiveFormAction] = useActionState(
    archivePlanAction,
    EMPTY_FORM_STATE
  )
  const [completeState, completeFormAction] = useActionState(
    completePlanAction,
    EMPTY_FORM_STATE
  )
  const updateFallback = useToastMessage(updateState)
  const archiveFallback = useToastMessage(archiveState)
  const completeFallback = useToastMessage(completeState)

  const openConfirmModal = useConfirmModalStore((state) => state.openConfirmModal)
  const archiveFormRef = useRef<HTMLFormElement>(null)
  const completeFormRef = useRef<HTMLFormElement>(null)

  const toggleStudyDay = (day: number) => {
    setStudyDays((days) =>
      days.includes(day)
        ? days.filter((d) => d !== day)
        : [...days, day].sort((a, b) => a - b)
    )
  }

  return (
    <div className="mt-6 pt-6 border-t border-zinc-200 space-y-6">
      <form action={updateFormAction} className="space-y-4">
        {updateFallback}
        <input type="hidden" name="planId" value={plan.id} />
        <input type="hidden" name="studyDays" value={JSON.stringify(studyDays)} />

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="settings-name"
              className="block text-xs font-semibold text-zinc-500 mb-1.5"
            >
              Nazwa planu
            </label>
            <input
              id="settings-name"
              type="text"
              name="name"
              defaultValue={plan.name}
              required
              minLength={3}
              maxLength={255}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:border-zinc-400"
            />
          </div>
          <div>
            <label
              htmlFor="settings-due-date"
              className="block text-xs font-semibold text-zinc-500 mb-1.5"
            >
              Termin
            </label>
            <input
              id="settings-due-date"
              type="date"
              name="dueDate"
              defaultValue={plan.dueDate.split('T')[0]}
              required
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:border-zinc-400"
            />
          </div>
          <div>
            <label
              htmlFor="settings-minutes"
              className="block text-xs font-semibold text-zinc-500 mb-1.5"
            >
              Minuty dziennie
            </label>
            <input
              id="settings-minutes"
              type="number"
              name="minutesPerDay"
              defaultValue={plan.minutesPerDay}
              required
              min={15}
              max={480}
              step={5}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:border-zinc-400"
            />
          </div>
          <div>
            <span className="block text-xs font-semibold text-zinc-500 mb-1.5">
              Dni nauki
            </span>
            <div className="flex gap-1.5">
              {WEEKDAYS.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleStudyDay(day.value)}
                  className={`w-9 h-9 rounded-lg text-xs font-semibold border transition-colors ${
                    studyDays.includes(day.value)
                      ? 'bg-red-500 text-white border-red-500'
                      : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={updatePending || studyDays.length === 0}
          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-700 disabled:opacity-40 transition-colors"
        >
          <Save className="w-4 h-4" />
          {updatePending ? 'Zapisywanie…' : 'Zapisz zmiany'}
        </button>
      </form>

      <div className="flex flex-wrap gap-3 pt-4 border-t border-zinc-200">
        <form action={completeFormAction} ref={completeFormRef}>
          {completeFallback}
          <input type="hidden" name="planId" value={plan.id} />
          <button
            type="button"
            onClick={() =>
              openConfirmModal({
                title: 'Zakończ plan',
                message:
                  'Oznaczyć plan jako ukończony? Będziesz mógł utworzyć nowy plan.',
                confirmLabel: 'Zakończ plan',
                onConfirm: () => completeFormRef.current?.requestSubmit(),
              })
            }
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-emerald-200 text-emerald-700 text-sm font-semibold hover:bg-emerald-50 transition-colors"
          >
            <CircleCheckBig className="w-4 h-4" />
            Oznacz jako ukończony
          </button>
        </form>

        <form action={archiveFormAction} ref={archiveFormRef}>
          {archiveFallback}
          <input type="hidden" name="planId" value={plan.id} />
          <button
            type="button"
            onClick={() =>
              openConfirmModal({
                title: 'Archiwizuj plan',
                message:
                  'Zarchiwizować ten plan? Postęp zostanie zachowany, a Ty będziesz mógł utworzyć nowy plan.',
                confirmLabel: 'Archiwizuj',
                onConfirm: () => archiveFormRef.current?.requestSubmit(),
              })
            }
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-zinc-200 text-zinc-600 text-sm font-semibold hover:bg-zinc-50 transition-colors"
          >
            <Archive className="w-4 h-4" />
            Archiwizuj plan
          </button>
        </form>
      </div>
    </div>
  )
}
