'use client'

import { useActionState } from 'react'
import {
  addConceptAction,
  removeConceptAction,
  toggleConceptAction,
} from '@/actions/planner'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { useToastMessage } from '@/hooks/useToastMessage'
import type { ConceptProgress } from '@/types/plannerTypes'

function ConceptRow({ concept }: { concept: ConceptProgress }) {
  const [toggleState, toggleAction, togglePending] = useActionState(
    toggleConceptAction,
    EMPTY_FORM_STATE
  )
  const [removeState, removeAction, removePending] = useActionState(
    removeConceptAction,
    EMPTY_FORM_STATE
  )
  const toggleFallback = useToastMessage(toggleState)
  const removeFallback = useToastMessage(removeState)

  const spentMinutes = concept.autoMinutes + concept.manualMinutes
  const ratio =
    concept.targetMinutes > 0
      ? Math.min(1, spentMinutes / concept.targetMinutes)
      : 0
  const done = Boolean(concept.completedAt)

  return (
    <li
      className={`flex items-center gap-3 px-3 py-3 rounded-xl border transition-colors ${
        done ? 'bg-emerald-50/50 border-emerald-100' : 'bg-white border-zinc-100'
      }`}
    >
      <form action={toggleAction}>
        {toggleFallback}
        <input type="hidden" name="conceptId" value={concept.id} />
        <button
          type="submit"
          disabled={togglePending}
          aria-label={done ? 'Oznacz jako nieukończone' : 'Oznacz jako ukończone'}
          className={`w-6 h-6 rounded-md border-2 flex items-center justify-center text-xs font-bold transition-colors ${
            done
              ? 'bg-emerald-500 border-emerald-500 text-white'
              : 'border-zinc-300 text-transparent hover:border-emerald-400'
          }`}
        >
          ✓
        </button>
      </form>

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium truncate ${
            done ? 'text-zinc-400 line-through' : 'text-zinc-800'
          }`}
        >
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

      <form action={removeAction}>
        {removeFallback}
        <input type="hidden" name="conceptId" value={concept.id} />
        <button
          type="submit"
          disabled={removePending}
          aria-label={`Usuń: ${concept.label}`}
          className="text-zinc-300 hover:text-red-500 text-sm font-bold px-1"
        >
          ✕
        </button>
      </form>
    </li>
  )
}

function AddConceptForm({ planId }: { planId: string }) {
  const [formState, action, isPending] = useActionState(
    addConceptAction,
    EMPTY_FORM_STATE
  )
  const noScriptFallback = useToastMessage(formState)

  return (
    <form
      action={action}
      className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-zinc-100"
    >
      {noScriptFallback}
      <input type="hidden" name="planId" value={planId} />
      <input
        type="text"
        name="label"
        required
        minLength={2}
        maxLength={255}
        placeholder="Nowe zagadnienie…"
        className="flex-1 min-w-40 px-4 py-2 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:border-zinc-400"
      />
      <input
        type="number"
        name="targetMinutes"
        defaultValue={60}
        min={5}
        max={6000}
        step={5}
        className="w-24 px-3 py-2 rounded-lg border border-zinc-200 text-sm text-right"
        aria-label="Czas w minutach"
      />
      <button
        type="submit"
        disabled={isPending}
        className="px-4 py-2 rounded-lg bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-700 disabled:opacity-40"
      >
        {isPending ? 'Dodawanie…' : 'Dodaj'}
      </button>
    </form>
  )
}

export default function ConceptList({
  planId,
  concepts,
}: {
  planId: string
  concepts: ConceptProgress[]
}) {
  return (
    <div>
      {concepts.length === 0 ? (
        <p className="text-sm text-zinc-500">
          Brak zagadnień w planie — dodaj pierwsze poniżej.
        </p>
      ) : (
        <ul className="space-y-2">
          {concepts.map((concept) => (
            <ConceptRow key={concept.id} concept={concept} />
          ))}
        </ul>
      )}
      <AddConceptForm planId={planId} />
    </div>
  )
}
