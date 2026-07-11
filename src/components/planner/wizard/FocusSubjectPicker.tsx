'use client'

import { Compass } from 'lucide-react'
import WizardFieldLabel from './WizardFieldLabel'
import type { PlanWizardController } from '@/hooks/usePlanWizard'

const SELECTED =
  'bg-gradient-to-r from-[#ff9898] to-fuchsia-400 text-white border-transparent shadow-sm'
const UNSELECTED = 'bg-white text-zinc-600 border-zinc-200 hover:border-[#ff9898]'

export default function FocusSubjectPicker({ wizard }: { wizard: PlanWizardController }) {
  if (wizard.catalog.length === 0) return null

  return (
    <div>
      <WizardFieldLabel icon={Compass} className="mb-1">
        Czego dotyczy plan?
      </WizardFieldLabel>
      <p className="text-xs text-zinc-400 mb-2">
        Wybierz przedmiot, a w kroku 3 podpowiemy Ci jego program — albo zostań przy całym kursie.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => wizard.selectFocus(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            wizard.focusKey === null ? SELECTED : UNSELECTED
          }`}
        >
          Cały kurs
        </button>
        {wizard.catalog.map((entry) => (
          <button
            key={entry.categoryKey}
            type="button"
            onClick={() => wizard.selectFocus(entry.categoryKey)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              wizard.focusKey === entry.categoryKey ? SELECTED : UNSELECTED
            }`}
          >
            {entry.label}
          </button>
        ))}
      </div>
    </div>
  )
}
