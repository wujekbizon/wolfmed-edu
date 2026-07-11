'use client'

import { ListChecks, Scale, X } from 'lucide-react'
import type { PlanWizardController } from '@/hooks/usePlanWizard'

export default function SelectedConceptsList({ wizard }: { wizard: PlanWizardController }) {
  if (wizard.concepts.length === 0) return null

  const plannedHours = Math.round((wizard.plannedMinutes / 60) * 10) / 10

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold text-zinc-700">
          <ListChecks className="w-4 h-4 text-[#ff9898]" />
          Twój plan ({wizard.concepts.length})
        </h3>
        {wizard.capacityMinutes > 0 && (
          <button
            type="button"
            onClick={wizard.distributeCapacity}
            className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-red-500"
          >
            <Scale className="w-3.5 h-3.5" />
            Rozłóż czas równomiernie
          </button>
        )}
      </div>

      <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {wizard.concepts.map((concept) => (
          <li
            key={concept.label}
            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-100"
          >
            <span className="flex-1 text-sm text-zinc-800">{concept.label}</span>
            <input
              type="number"
              value={concept.targetMinutes}
              onChange={(event) => wizard.updateConceptMinutes(concept.label, Number(event.target.value))}
              className="w-20 px-2 py-1 rounded border border-zinc-200 text-sm text-right"
              aria-label={`Minuty na: ${concept.label}`}
            />
            <span className="text-xs text-zinc-400">min</span>
            <button
              type="button"
              onClick={() => wizard.removeConcept(concept.label)}
              className="flex items-center justify-center w-6 h-6 rounded text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              aria-label={`Usuń: ${concept.label}`}
            >
              <X className="w-4 h-4" />
            </button>
          </li>
        ))}
      </ul>

      <div
        className={`mt-3 p-3 rounded-lg text-sm border ${
          wizard.overCapacity
            ? 'bg-amber-50 border-amber-200 text-amber-800'
            : 'bg-zinc-50 border-zinc-100 text-zinc-600'
        }`}
      >
        Zaplanowane: <span className="font-semibold">{plannedHours} h</span> / dostępne do terminu:{' '}
        <span className="font-semibold">{wizard.hoursTotal} h</span>
        {wizard.overCapacity && (
          <span className="block mt-1">
            To więcej, niż realnie zmieścisz. Zmniejsz zakres, skróć czas na zagadnienia albo przesuń termin —
            lepszy skromny plan, który wykonasz, niż ambitny, który porzucisz.
          </span>
        )}
      </div>
    </div>
  )
}
