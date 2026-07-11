'use client'

import type { PlanWizardController } from '@/hooks/usePlanWizard'

export default function WizardNav({ wizard }: { wizard: PlanWizardController }) {
  const { step, setStep, stepOneValid, stepTwoValid, stepThreeValid } = wizard

  return (
    <div className="flex items-center justify-between mt-8 pt-6 border-t border-zinc-200">
      <button
        type="button"
        onClick={() => setStep((s) => Math.max(0, s - 1))}
        disabled={step === 0}
        className="px-5 py-2.5 rounded-lg text-sm font-semibold text-zinc-600 hover:bg-zinc-50 disabled:opacity-0"
      >
        Wstecz
      </button>

      {step < 2 ? (
        <button
          type="button"
          onClick={() => setStep((s) => s + 1)}
          disabled={step === 0 ? !stepOneValid : !stepTwoValid}
          className="px-6 py-2.5 rounded-lg bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Dalej
        </button>
      ) : (
        <form action={wizard.action}>
          {wizard.noScriptFallback}
          <input type="hidden" name="courseSlug" value={wizard.courseSlug} />
          <input type="hidden" name="name" value={wizard.name} />
          <input type="hidden" name="goalType" value={wizard.goalType} />
          <input type="hidden" name="focusCategoryKey" value={wizard.focusKey ?? ''} />
          <input type="hidden" name="dueDate" value={wizard.dueDate} />
          <input type="hidden" name="minutesPerDay" value={wizard.minutesPerDay} />
          <input type="hidden" name="studyDays" value={JSON.stringify(wizard.studyDays)} />
          <input type="hidden" name="concepts" value={JSON.stringify(wizard.concepts)} />
          <button
            type="submit"
            disabled={!stepThreeValid || wizard.isPending}
            className="px-6 py-2.5 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {wizard.isPending ? 'Tworzenie…' : 'Utwórz plan nauki'}
          </button>
        </form>
      )}
    </div>
  )
}
