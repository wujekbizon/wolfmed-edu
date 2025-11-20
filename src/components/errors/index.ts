/**
 * Error handling components for Next.js error boundaries
 *
 * Usage in error.tsx files:
 *
 * @example
 * ```tsx
 * import { ErrorBoundary } from '@/components/errors'
 *
 * export default function Error(props) {
 *   return <ErrorBoundary {...props} context="notes" />
 * }
 * ```
 */

export { default as ErrorBoundary } from './ErrorBoundary'
export { default as CustomError } from './CustomError'
export type { ErrorContext } from './ErrorBoundary'
