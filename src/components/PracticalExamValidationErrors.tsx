'use client'

import { useEffect, useRef } from 'react'
import FieldError from '@/components/FieldError'
import type { PracticalExamValidationErrorsProps } from '@/types/practicalExamWorkspaceTypes'

export default function PracticalExamValidationErrors({ formState }: PracticalExamValidationErrorsProps) {
  const summary = useRef<HTMLDivElement>(null)
  const names = formState.status === 'ERROR'
    ? Object.keys(formState.fieldErrors).filter((name) => formState.fieldErrors[name]?.length)
    : []
  const hasErrors = names.length > 0

  useEffect(() => {
    if (!hasErrors) return
    summary.current?.scrollIntoView({ block: 'start' })
    summary.current?.focus({ preventScroll: true })
  }, [hasErrors, formState.timestamp])

  if (!hasErrors) return null
  return (
    <div ref={summary} role='alert' tabIndex={-1} className='mb-5 space-y-2 rounded-xl border border-rose-200 bg-rose-50 p-4 focus-visible:outline-2 focus-visible:outline-rose-400'>
      <h2 className='text-sm font-semibold text-rose-900'>Nie udało się sprawdzić arkusza</h2>
      {names.map((name) => <FieldError key={name} name={name} formState={formState} />)}
    </div>
  )
}
