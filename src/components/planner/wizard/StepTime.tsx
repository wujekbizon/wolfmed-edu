'use client'

import { Clock, CalendarDays } from 'lucide-react'
import WizardFieldLabel from './WizardFieldLabel'
import WeekdayPicker from './WeekdayPicker'
import CapacitySummary from './CapacitySummary'
import { MIN_MINUTES_PER_DAY, MAX_MINUTES_PER_DAY } from '@/constants/planner'
import type { PlanWizardController } from '@/hooks/usePlanWizard'

export default function StepTime({ wizard }: { wizard: PlanWizardController }) {
  return (
    <div className="space-y-6">
      <div>
        <WizardFieldLabel icon={Clock} htmlFor="minutes-per-day">
          Ile minut dziennie możesz się uczyć?{' '}
          <span className="text-[#ff9898] font-bold">{wizard.minutesPerDay} min</span>
        </WizardFieldLabel>
        <input
          id="minutes-per-day"
          type="range"
          min={MIN_MINUTES_PER_DAY}
          max={MAX_MINUTES_PER_DAY}
          step={15}
          value={wizard.minutesPerDay}
          onChange={(event) => wizard.setMinutesPerDay(Number(event.target.value))}
          className="w-full accent-[#ff9898]"
        />
        <div className="flex justify-between text-xs text-zinc-400 mt-1">
          <span>15 min</span>
          <span>4 h</span>
        </div>
      </div>

      <div>
        <WizardFieldLabel icon={CalendarDays}>W które dni się uczysz?</WizardFieldLabel>
        <WeekdayPicker studyDays={wizard.studyDays} onToggle={wizard.toggleStudyDay} />
      </div>

      {wizard.capacityMinutes > 0 && (
        <CapacitySummary dueDate={wizard.dueDate} hoursTotal={wizard.hoursTotal} />
      )}
    </div>
  )
}
