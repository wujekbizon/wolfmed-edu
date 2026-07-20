'use client'

import { usePlanWizard } from '@/hooks/usePlanWizard'
import WizardStepIndicator from './wizard/WizardStepIndicator'
import StepGoal from './wizard/StepGoal'
import StepTime from './wizard/StepTime'
import StepScope from './wizard/StepScope'
import WizardNav from './wizard/WizardNav'
import type { PlanWizardProps } from '@/types/plannerTypes'

export default function PlanWizard({
  courses,
  catalogByCourse,
  examPresetsByCourse,
  proceduresByCourse,
  initialFocus = null,
}: PlanWizardProps) {
  const wizard = usePlanWizard({ courses, catalogByCourse, proceduresByCourse, initialFocus })

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white border border-zinc-200 rounded-2xl p-4 sm:p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-zinc-900 mb-1">Stwórz swój plan nauki</h1>
        <p className="text-sm text-zinc-500 mb-6">
          Ustal cel, realny czas i zakres — resztą zajmie się Wolfmed.
        </p>

        <WizardStepIndicator step={wizard.step} />

        {wizard.step === 0 && (
          <StepGoal
            courses={courses}
            examPresets={examPresetsByCourse[wizard.courseSlug] ?? []}
            wizard={wizard}
          />
        )}
        {wizard.step === 1 && <StepTime wizard={wizard} />}
        {wizard.step === 2 && <StepScope wizard={wizard} />}

        <WizardNav wizard={wizard} />
      </div>
    </div>
  )
}
