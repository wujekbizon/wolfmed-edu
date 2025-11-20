'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import CustomError from './CustomError'

export type ErrorContext =
  | 'root'
  | 'panel'
  | 'notes'
  | 'forum'
  | 'blog'
  | 'test'
  | 'procedure'
  | 'results'
  | 'materials'
  | 'flashcards'

interface ErrorBoundaryProps {
  error: Error & { digest?: string }
  reset: () => void
  context?: ErrorContext
}

/**
 * Generic ErrorBoundary component for Next.js error.tsx files
 *
 * Handles:
 * - Sentry error tracking with context tags
 * - Context-aware error messages
 * - Development debugging info
 * - User-friendly UI with reset functionality
 *
 * Usage in error.tsx files:
 * ```
 * import { ErrorBoundary } from '@/components/errors'
 * export default function Error(props) {
 *   return <ErrorBoundary {...props} context="notes" />
 * }
 * ```
 */
export default function ErrorBoundary({
  error,
  reset,
  context = 'root'
}: ErrorBoundaryProps) {
  useEffect(() => {
    // Log to Sentry with context tags for better filtering
    Sentry.captureException(error, {
      tags: {
        errorBoundary: context,
        digest: error.digest
      },
      level: 'error'
    })

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`[ErrorBoundary:${context}]`, error)
    }
  }, [error, context])

  return <CustomError error={error} reset={reset} context={context} />
}
