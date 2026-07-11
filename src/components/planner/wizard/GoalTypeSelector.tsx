'use client'

import { Flag } from 'lucide-react'
import WizardFieldLabel from './WizardFieldLabel'
import type { PlanWizardController } from '@/hooks/usePlanWizard'

const SEG = 'px-4 py-2 rounded-lg text-sm font-medium border transition-colors'
const SEG_ON = 'bg-zinc-900 text-white border-zinc-900'
const SEG_OFF = 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'

export default function GoalTypeSelector({ wizard }: { wizard: PlanWizardController }) {
  return (
    <div>
      <WizardFieldLabel icon={Flag}>Cel planu</WizardFieldLabel>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => wizard.setGoalType('exam')}
          className={`${SEG} ${wizard.goalType === 'exam' ? SEG_ON : SEG_OFF}`}
        >
          Egzamin
        </button>
        <button
          type="button"
          onClick={() => wizard.setGoalType('custom')}
          className={`${SEG} ${wizard.goalType === 'custom' ? SEG_ON : SEG_OFF}`}
        >
          Własny cel
        </button>
      </div>
    </div>
  )
}
