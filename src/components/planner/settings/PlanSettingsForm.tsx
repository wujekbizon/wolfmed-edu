'use client'

import { useState, useActionState } from 'react'
import { updatePlanAction } from '@/actions/planner'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { useToastMessage } from '@/hooks/useToastMessage'
import Input from '@/components/ui/Input'
import Label from '@/components/ui/Label'
import FieldError from '@/components/FieldError'
import SubmitButton from '@/components/SubmitButton'
import WeekdayPicker from '../wizard/WeekdayPicker'
import type { PlanProgress } from '@/types/plannerTypes'

const LABEL_CLASS = 'block text-xs font-semibold text-zinc-500 mb-1.5'
const FIELD_CLASS =
  'w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff9898]/50 focus:border-transparent transition-shadow'

export default function PlanSettingsForm({ plan }: { plan: PlanProgress['plan'] }) {
  const [studyDays, setStudyDays] = useState<number[]>(plan.studyDays)
  const [formState, action] = useActionState(updatePlanAction, EMPTY_FORM_STATE)
  const fallback = useToastMessage(formState)

  const toggleStudyDay = (day: number) =>
    setStudyDays((days) =>
      days.includes(day) ? days.filter((d) => d !== day) : [...days, day].sort((a, b) => a - b)
    )

  return (
    <form action={action} className="space-y-4">
      {fallback}
      <input type="hidden" name="planId" value={plan.id} />
      <input type="hidden" name="studyDays" value={JSON.stringify(studyDays)} />

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="settings-name" label="Nazwa planu" className={LABEL_CLASS} />
          <Input id="settings-name" type="text" name="name" defaultValue={plan.name} className={FIELD_CLASS} />
          <FieldError name="name" formState={formState} />
        </div>
        <div>
          <Label htmlFor="settings-due-date" label="Termin" className={LABEL_CLASS} />
          <Input id="settings-due-date" type="date" name="dueDate" defaultValue={plan.dueDate.split('T')[0]} className={FIELD_CLASS} />
          <FieldError name="dueDate" formState={formState} />
        </div>
        <div>
          <Label htmlFor="settings-minutes" label="Minuty dziennie" className={LABEL_CLASS} />
          <Input id="settings-minutes" type="number" name="minutesPerDay" defaultValue={plan.minutesPerDay} className={FIELD_CLASS} />
          <FieldError name="minutesPerDay" formState={formState} />
        </div>
        <div>
          <span className={LABEL_CLASS}>Dni nauki</span>
          <WeekdayPicker studyDays={studyDays} onToggle={toggleStudyDay} />
        </div>
      </div>

      <div className="w-full sm:w-auto">
        <SubmitButton label="Zapisz zmiany" loading="Zapisywanie…" disabled={studyDays.length === 0} className="sm:w-auto sm:px-6" />
      </div>
    </form>
  )
}
