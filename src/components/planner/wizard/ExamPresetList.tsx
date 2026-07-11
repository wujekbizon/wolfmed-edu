'use client'

import { CalendarDays } from 'lucide-react'
import WizardFieldLabel from './WizardFieldLabel'
import { toDateInputValue } from '@/helpers/toDateInputValue'
import { formatPlDate } from '@/helpers/formatPlDate'
import type { ExamDatePreset } from '@/types/plannerTypes'
import type { PlanWizardController } from '@/hooks/usePlanWizard'

export default function ExamPresetList({
  presets,
  wizard,
}: {
  presets: ExamDatePreset[]
  wizard: PlanWizardController
}) {
  if (wizard.goalType !== 'exam' || presets.length === 0) return null

  return (
    <div>
      <WizardFieldLabel icon={CalendarDays}>Najbliższe sesje egzaminacyjne</WizardFieldLabel>
      <div className="space-y-2">
        {presets.map((preset) => {
          const selected = wizard.dueDate === toDateInputValue(preset.dateISO)
          return (
            <button
              key={preset.dateISO}
              type="button"
              onClick={() => {
                wizard.setDueDate(toDateInputValue(preset.dateISO))
                if (!wizard.focusKey) wizard.editNameFromPreset(preset.label)
              }}
              className={`w-full flex items-center gap-3 text-left px-4 py-3 rounded-lg border text-sm transition-all ${
                selected
                  ? 'border-[#ff9898] bg-[#ff9898]/10 text-zinc-900 shadow-sm'
                  : 'border-zinc-200 text-zinc-600 hover:border-[#ff9898]'
              }`}
            >
              <span
                className={`flex items-center justify-center w-9 h-9 rounded-lg shrink-0 transition-colors ${
                  selected ? 'bg-gradient-to-br from-[#ff9898] to-fuchsia-400 text-white' : 'bg-zinc-100 text-zinc-400'
                }`}
              >
                <CalendarDays className="w-4 h-4" />
              </span>
              <span>
                <span className="font-medium block">{preset.label}</span>
                <span className="block text-xs text-zinc-400 mt-0.5">{formatPlDate(preset.dateISO)}</span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
