'use client'
import { cloneElement, isValidElement, ReactNode, useState, useEffect, useId } from 'react'

interface TooltipProps {
  message: string
  children: ReactNode
  className?: string
  position?:
    | 'top'
    | 'right'
    | 'bottom'
    | 'left'
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
}

export function Tooltip({ message, children, className = '', position = 'top' }: TooltipProps) {
  const [open, setOpen] = useState(false)
  const id = `tooltip-${useId()}`

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    'top-left': 'bottom-full right-0 mb-2',
    'top-right': 'bottom-full left-0 mb-2',
    'bottom-left': 'top-full right-0 mt-2',
    'bottom-right': 'top-full left-0 mt-2'
  }
  const describedChild = isValidElement<{ 'aria-describedby'?: string }>(children)
    ? cloneElement(children, {
        'aria-describedby': [children.props['aria-describedby'], id].filter(Boolean).join(' '),
      })
    : children

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {describedChild}
      <div
        id={id}
        role='tooltip'
        className={`
          absolute ${positionClasses[position]}
          bg-zinc-200 text-zinc-900
          border border-zinc-400
          text-sm font-medium px-1.5 py-1 rounded-lg shadow-lg
          backdrop-blur-sm
          whitespace-nowrap pointer-events-none
          transition-all duration-200 ${open ? 'opacity-100' : 'opacity-0'} z-[100]
        `}
      >
        {message}
      </div>
    </div>
  )
}
