'use client'

import { motion, useReducedMotion } from 'framer-motion'
import type { KeyboardEvent } from 'react'
import type { TabNavigationProps } from '@/types/tabTypes'

export default function TabNavigation({ id, label, options, active, onChange, variant = 'pills' }: TabNavigationProps) {
  const reducedMotion = useReducedMotion()

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index
    if (event.key === 'ArrowRight') next = (index + 1) % options.length
    else if (event.key === 'ArrowLeft') next = (index - 1 + options.length) % options.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = options.length - 1
    else return
    event.preventDefault()
    const option = options[next]
    if (!option) return
    onChange(option.id)
    document.getElementById(`${id}-tab-${option.id}`)?.focus({ preventScroll: true })
  }

  return (
    <div role='tablist' aria-label={label} className={`flex w-full gap-1 ${variant === 'pills' ? 'rounded-2xl border border-zinc-200/70 bg-white/90 p-1 shadow-sm' : 'border-b border-zinc-200'}`}>
      {options.map((option, index) => (
        <button
          key={option.id}
          type='button'
          role='tab'
          id={`${id}-tab-${option.id}`}
          aria-controls={`${id}-panel-${option.id}`}
          aria-selected={active === option.id}
          tabIndex={active === option.id ? 0 : -1}
          onClick={() => onChange(option.id)}
          onKeyDown={(event) => handleKeyDown(event, index)}
          className={`relative min-h-11 min-w-0 flex-1 cursor-pointer rounded-xl px-1.5 py-2.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400 sm:px-5 sm:text-sm ${active === option.id ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-800'}`}
        >
          {active === option.id && (
            <motion.span
              layoutId={`${id}-indicator`}
              className={variant === 'pills' ? 'absolute inset-0 rounded-xl bg-[#ff9898]/20 ring-1 ring-inset ring-[#ff9898]/30' : 'absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-[#e07070]'}
              transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 450, damping: 36 }}
            />
          )}
          <span className='relative'>{option.label}</span>
        </button>
      ))}
    </div>
  )
}
