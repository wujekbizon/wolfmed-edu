'use client'

import { Tag, CalendarClock } from 'lucide-react'
import WizardFieldLabel from './WizardFieldLabel'
import CourseSelector from './CourseSelector'
import GoalTypeSelector from './GoalTypeSelector'
import FocusSubjectPicker from './FocusSubjectPicker'
import ExamPresetList from './ExamPresetList'
import { PLAN_INPUT_CLASS } from '@/constants/planner'
import type { ExamDatePreset } from '@/types/plannerTypes'
import type { PlanWizardController } from '@/hooks/usePlanWizard'

export default function StepGoal({
  courses,
  examPresets,
  wizard,
}: {
  courses: { slug: string; name: string }[]
  examPresets: ExamDatePreset[]
  wizard: PlanWizardController
}) {
  const minDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  return (
    <div className="space-y-5">
      <CourseSelector courses={courses} wizard={wizard} />
      <GoalTypeSelector wizard={wizard} />
      <FocusSubjectPicker wizard={wizard} />
      <ExamPresetList presets={examPresets} wizard={wizard} />

      <div>
        <WizardFieldLabel icon={Tag} htmlFor="plan-name">
          Nazwa planu
        </WizardFieldLabel>
        <input
          id="plan-name"
          type="text"
          value={wizard.name}
          onChange={(event) => wizard.editName(event.target.value)}
          placeholder="np. Przygotowanie do egzaminu — zima 2027"
          maxLength={255}
          className={PLAN_INPUT_CLASS}
        />
      </div>

      <div>
        <WizardFieldLabel icon={CalendarClock} htmlFor="plan-due-date">
          Termin (do kiedy?)
        </WizardFieldLabel>
        <input
          id="plan-due-date"
          type="date"
          value={wizard.dueDate}
          min={minDate}
          onChange={(event) => wizard.setDueDate(event.target.value)}
          className={PLAN_INPUT_CLASS}
        />
      </div>
    </div>
  )
}
