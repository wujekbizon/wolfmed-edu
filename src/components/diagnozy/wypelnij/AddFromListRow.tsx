'use client'

import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Plus, X } from 'lucide-react'
import WypelnijSelect from '@/components/diagnozy/wypelnij/WypelnijSelect'

type Option = { text: string; detail?: string }

// Builds up a form field one pick at a time: select an item, "Dodaj" appends
// it; added interventions also reveal their uzasadnienie (teaching payload).
export default function AddFromListRow({
  options,
  added,
  onAdd,
  onRemove,
  placeholder,
  ariaLabel,
}: {
  options: Option[]
  added: string[]
  onAdd: (text: string) => void
  onRemove: (text: string) => void
  placeholder: string
  ariaLabel: string
}) {
  const [pending, setPending] = useState('')
  const prefersReducedMotion = useReducedMotion()
  const remaining = options.filter((option) => !added.includes(option.text))
  const addedOptions = added
    .map((text) => options.find((option) => option.text === text))
    .filter((option): option is Option => !!option)

  const handleAdd = () => {
    if (!pending) return
    onAdd(pending)
    setPending('')
  }

  return (
    <div className="flex flex-col gap-3">
      {addedOptions.length > 0 && (
        <ul className="flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {addedOptions.map((option) => (
              <motion.li
                key={option.text}
                initial={prefersReducedMotion ? false : { opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
                className="flex items-start gap-2 bg-rose-50/70 border border-rose-200 rounded-xl p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-zinc-700">{option.text}</p>
                  {option.detail && (
                    <p className="mt-1.5 pt-1.5 border-t border-rose-200/70 text-xs text-zinc-500">
                      <span className="font-semibold uppercase tracking-wide">
                        Uzasadnienie:{' '}
                      </span>
                      {option.detail}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(option.text)}
                  aria-label={`Usuń: ${option.text}`}
                  className="shrink-0 p-1 rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {remaining.length > 0 ? (
        <div className="flex flex-col sm:flex-row sm:items-start gap-2 min-w-0">
          <WypelnijSelect
            options={remaining.map((option) => ({
              value: option.text,
              label: option.text,
            }))}
            value={pending || null}
            onSelect={setPending}
            placeholder={placeholder}
            ariaLabel={ariaLabel}
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={!pending}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl shrink-0
              text-white bg-rose-500 hover:bg-rose-600 transition-colors cursor-pointer
              disabled:opacity-40 disabled:cursor-not-allowed self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Dodaj
          </button>
        </div>
      ) : (
        <p className="text-xs text-emerald-700">Dodano wszystkie pozycje z listy.</p>
      )}
      <p className="text-xs text-zinc-400" aria-live="polite">
        Dodano {added.length} z {options.length}
      </p>
    </div>
  )
}
