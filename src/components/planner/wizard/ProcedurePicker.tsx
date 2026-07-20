'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Stethoscope } from 'lucide-react'
import type { PlanWizardController } from '@/hooks/usePlanWizard'

export default function ProcedurePicker({ wizard }: { wizard: PlanWizardController }) {
  const [expanded, setExpanded] = useState(false)

  if (wizard.procedureOptions.length === 0) return null

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-700 hover:text-zinc-900"
      >
        {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        <Stethoscope className="w-4 h-4 text-[#ff9898]" />
        Procedury ({wizard.procedureOptions.length})
      </button>
      <p className="text-xs text-zinc-400 mt-1 ml-5">
        Dodaj procedury do planu — czas z wyzwań proceduralnych zaliczy się dokładnie do nich.
      </p>

      {expanded && (
        <ul className="mt-2 space-y-1 max-h-72 overflow-y-auto pr-1 border border-zinc-200 rounded-lg p-2">
          {wizard.procedureOptions.map((procedure) => {
            const added = wizard.hasConcept(procedure.name.slice(0, 255))
            return (
              <li
                key={procedure.id}
                className="flex items-center justify-between gap-3 px-2 py-1.5 rounded-md hover:bg-zinc-50"
              >
                <span className="text-sm text-zinc-700 leading-snug">{procedure.name}</span>
                {added ? (
                  <button
                    type="button"
                    onClick={() => wizard.removeConcept(procedure.name.slice(0, 255))}
                    className="shrink-0 px-2.5 py-1 rounded-md text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100"
                  >
                    Usuń
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => wizard.addProcedureConcept(procedure)}
                    className="shrink-0 px-2.5 py-1 rounded-md text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-700"
                  >
                    Dodaj
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
