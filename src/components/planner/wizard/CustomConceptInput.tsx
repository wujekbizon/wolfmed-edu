'use client'

import { Plus } from 'lucide-react'
import type { PlanWizardController } from '@/hooks/usePlanWizard'

export default function CustomConceptInput({ wizard }: { wizard: PlanWizardController }) {
  const disabled = wizard.customLabel.trim().length < 2
  return (
    <div>
      <h3 className="flex items-center gap-1.5 text-sm font-semibold text-zinc-700 mb-2">
        <Plus className="w-4 h-4 text-[#ff9898]" />
        Własne zagadnienie
      </h3>
      <div className="flex gap-2">
        <input
          type="text"
          value={wizard.customLabel}
          onChange={(event) => wizard.setCustomLabel(event.target.value)}
          placeholder="np. Farmakologia z wykładów"
          className="flex-1 min-w-0 px-4 py-2.5 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff9898]/50 focus:border-transparent transition-shadow"
        />
        <button
          type="button"
          onClick={wizard.addCustomConcept}
          disabled={disabled}
          title={disabled ? 'Wpisz co najmniej 2 znaki' : undefined}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-700 transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-zinc-900"
        >
          <Plus className="w-4 h-4" />
          Dodaj
        </button>
      </div>
    </div>
  )
}
