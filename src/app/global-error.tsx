'use client'

import * as Sentry from '@sentry/nextjs'
import Link from 'next/link'
import { useEffect } from 'react'

/**
 * Global Error Handler for Next.js App
 * Catches errors that escape the normal error boundary hierarchy
 * Including database connection errors
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to Sentry
    Sentry.captureException(error)
    // Also log to console for debugging
    console.error('🚨 Global Error:', error)
  }, [error])

  const isDatabaseError =
    error.message.includes('database') ||
    error.message.includes('connection') ||
    error.message.includes('query') ||
    error.message.includes('CONNECTION_LIMIT') ||
    error.message.includes('circuit breaker')

  const isConnectionLimitError =
    error.message.includes('CONNECTION_LIMIT') ||
    error.message.includes('connection limit') ||
    error.message.includes('compute time quota') ||
    error.message.includes('too many connections')

  return (
    <html>
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-red-600 mb-4">
                {isConnectionLimitError ? '⚠️ Serwis czasowo niedostępny' : '😕 Ups, coś poszło nie tak'}
              </h1>

              {isConnectionLimitError ? (
                <div className="space-y-4 mb-8">
                  <p className="text-lg text-gray-700">
                    Nasz serwis przekroczył limit zasobów bazy danych.
                  </p>
                  <p className="text-gray-600">
                    Pracujemy nad rozwiązaniem problemu. Spróbuj ponownie za kilka minut.
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded p-4 mt-4">
                    <p className="text-sm text-amber-800">
                      💡 <strong>Wskazówka:</strong> Jeśli jesteś zalogowany, możesz dalej korzystać
                      z większości funkcji offline.
                    </p>
                  </div>
                </div>
              ) : isDatabaseError ? (
                <div className="space-y-4 mb-8">
                  <p className="text-lg text-gray-700">
                    Wystąpił problem z połączeniem do bazy danych.
                  </p>
                  <p className="text-gray-600">
                    Twoje dane są bezpieczne. Spróbuj odświeżyć stronę.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 mb-8">
                  <p className="text-lg text-gray-700">
                    Wystąpił nieoczekiwany błąd.
                  </p>
                  <p className="text-gray-600">
                    Jeśli problem się powtarza, skontaktuj się z nami.
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                <button
                  onClick={reset}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Spróbuj ponownie
                </button>
                <Link
                  href="/"
                  className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Wróć do strony głównej
                </Link>
                <Link
                  href="/#contact"
                  className="px-6 py-3 text-blue-600 hover:text-blue-800 transition-colors font-semibold"
                >
                  Kontakt
                </Link>
              </div>

              {process.env.NODE_ENV === 'development' && (
                <details className="mt-8 text-left bg-gray-100 rounded p-4">
                  <summary className="cursor-pointer font-bold text-red-600 mb-2">
                    🔧 Debug Info (Development Only)
                  </summary>
                  <div className="space-y-2 text-sm">
                    <p><strong>Error Name:</strong> {error.name}</p>
                    <p><strong>Message:</strong> {error.message}</p>
                    {error.digest && <p><strong>Digest:</strong> {error.digest}</p>}
                    {error.stack && (
                      <pre className="mt-2 text-xs overflow-auto max-h-60 bg-white p-2 rounded border">
                        {error.stack}
                      </pre>
                    )}
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
