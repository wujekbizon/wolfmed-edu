'use client'

import { useActionState } from 'react'
import { Check, X } from 'lucide-react'
import { removeConceptAction, toggleConceptAction } from '@/actions/planner'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { useToastMessage } from '@/hooks/useToastMessage'
import type { ConceptProgress } from '@/types/plannerTypes'

export default function ConceptRow({ concept }: { concept: ConceptProgress }) {
  const [toggleState, toggleAction, togglePending] = useActionState(toggleConceptAction, EMPTY_FORM_STATE)
  const [removeState, removeAction, removePending] = useActionState(removeConceptAction, EMPTY_FORM_STATE)
  const toggleFallback = useToastMessage(toggleState)
  const removeFallback = useToastMessage(removeState)

  const spentMinutes = concept.autoMinutes + concept.manualMinutes
  const ratio = concept.targetMinutes > 0 ? Math.min(1, spentMinutes / concept.targetMinutes) : 0
  const done = Boolean(concept.completedAt)

  return (
    <li
      className={`flex items-center gap-3 px-3 py-3 rounded-xl border transition-colors ${
        done ? 'bg-emerald-50/50 border-emerald-100' : 'bg-white border-zinc-200'
      }`}
    >
      <form action={toggleAction} className="shrink-0">
        {toggleFallback}
        <input type="hidden" name="conceptId" value={concept.id} />
        <button
          type="submit"
          disabled={togglePending}
          aria-label={done ? 'Oznacz jako nieukończone' : 'Oznacz jako ukończone'}
          className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
            done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-zinc-300 text-transparent hover:border-emerald-400'
          }`}
        >
          <Check className="w-3.5 h-3.5" strokeWidth={3} />
        </button>
      </form>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${done ? 'text-zinc-400 line-through' : 'text-zinc-800'}`}>
          {concept.label}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${done ? 'bg-emerald-400' : 'bg-red-400'}`}
              style={{ width: `${Math.round(ratio * 100)}%` }}
            />
          </div>
          <span className="text-xs text-zinc-400 whitespace-nowrap">
            {spentMinutes}/{concept.targetMinutes} min
          </span>
        </div>
        {concept.autoMinutes > 0 && (
          <p className="text-[11px] text-zinc-400 mt-0.5">
            w tym {concept.autoMinutes} min wykryte automatycznie (testy, notatki)
          </p>
        )}
      </div>

      <form action={removeAction} className="shrink-0">
        {removeFallback}
        <input type="hidden" name="conceptId" value={concept.id} />
        <button
          type="submit"
          disabled={removePending}
          aria-label={`Usuń: ${concept.label}`}
          className="flex items-center justify-center w-7 h-7 rounded-md text-zinc-300 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </form>
    </li>
  )
}
