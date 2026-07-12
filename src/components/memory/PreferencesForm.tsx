'use client'

import { useActionState } from 'react'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { updatePreferencesAction } from '@/actions/memory-actions'
import { PREFERENCE_DEFS } from '@/constants/memoryPreferences'
import SubmitButton from '@/components/SubmitButton'
import { useToastMessage } from '@/hooks/useToastMessage'

export default function PreferencesForm({ initial }: { initial: Record<string, string> }) {
  const [state, action] = useActionState(updatePreferencesAction, EMPTY_FORM_STATE)
  const noScriptFallback = useToastMessage(state)

  const current = (key: string) => state.values?.[key]?.toString() ?? initial[key] ?? ''

  return (
    <form action={action} className="flex flex-col gap-4">
      {PREFERENCE_DEFS.map((def) => (
        <div key={def.key} className="flex flex-col gap-1.5">
          <label htmlFor={def.key} className="text-sm font-medium text-zinc-700">
            {def.label}
          </label>
          <select
            id={def.key}
            name={def.key}
            defaultValue={current(def.key)}
            className="w-full px-3 py-2 rounded-lg bg-white/80 backdrop-blur-sm text-sm border border-zinc-200 outline-none focus:ring-2 focus:ring-[#ff9898]/50 transition-all duration-300 text-zinc-700"
          >
            {def.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-zinc-500">{def.help}</p>
        </div>
      ))}

      <SubmitButton
        label="Zapisz preferencje"
        loading="Zapisywanie..."
        className="mt-2 text-sm"
      />
      {noScriptFallback}
    </form>
  )
}
