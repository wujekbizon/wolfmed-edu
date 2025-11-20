'use client'

import { ErrorBoundary } from '@/components/errors'

export default function Error(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorBoundary {...props} context="blog" />
}
