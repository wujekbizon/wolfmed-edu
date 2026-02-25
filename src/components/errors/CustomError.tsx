'use client'

import Link from 'next/link'
import type { ErrorContext } from './ErrorBoundary'

interface CustomErrorProps {
  error: Error & { digest?: string }
  reset: () => void
  context?: ErrorContext
}

interface ErrorMessage {
  title: string
  message: string
  action: string
}

const ERROR_MESSAGES: Record<string, ErrorMessage> = {
  AuthError: {
    title: 'Sesja wygasła',
    message: 'Twoja sesja wygasła. Zaloguj się ponownie, aby kontynuować.',
    action: 'Zaloguj się'
  },
  LexicalError: {
    title: 'Błąd edytora notatek',
    message: 'Edytor napotkał problem. Twoje notatki są bezpieczne.',
    action: 'Odśwież edytor'
  },
  NetworkError: {
    title: 'Brak połączenia',
    message: 'Sprawdź połączenie internetowe i spróbuj ponownie.',
    action: 'Spróbuj ponownie'
  },
  DatabaseError: {
    title: 'Problem z bazą danych',
    message: 'Wystąpił problem z zapisem danych. Spróbuj za chwilę.',
    action: 'Spróbuj ponownie'
  },

  notes: {
    title: 'Problem z notatkami',
    message: 'Nie udało się załadować notatek. Twoje dane są bezpieczne.',
    action: 'Odśwież notatki'
  },
  test: {
    title: 'Problem z testem',
    message: 'Twój postęp został zapisany. Możesz kontynuować test.',
    action: 'Powrót do testu'
  },
  results: {
    title: 'Problem z wynikami',
    message: 'Nie udało się załadować wyników testów.',
    action: 'Odśwież wyniki'
  },
  forum: {
    title: 'Problem z forum',
    message: 'Nie udało się załadować forum. Spróbuj za moment.',
    action: 'Odśwież forum'
  },
  blog: {
    title: 'Problem z blogiem',
    message: 'Nie udało się załadować artykułu.',
    action: 'Powrót do bloga'
  },
  procedure: {
    title: 'Problem z procedurą',
    message: 'Nie udało się załadować procedury medycznej.',
    action: 'Odśwież procedurę'
  },
  materials: {
    title: 'Problem z materiałami',
    message: 'Nie udało się załadować materiałów edukacyjnych.',
    action: 'Odśwież materiały'
  },
  flashcards: {
    title: 'Problem z fiszkami',
    message: 'Nie udało się załadować fiszek.',
    action: 'Odśwież fiszki'
  },
  panel: {
    title: 'Problem z panelem',
    message: 'Wystąpił problem z załadowaniem strony.',
    action: 'Spróbuj ponownie'
  },

  default: {
    title: 'Ups, coś się wydarzyło',
    message: 'Jeśli problem się powtarza, skontaktuj się z naszym biurem obsługi.',
    action: 'Spróbuj ponownie'
  }
}

/**
 * Determines appropriate error message based on error type and context
 */
function getErrorMessage(error: Error, context?: ErrorContext): ErrorMessage {
  // Check for specific error types first
  if (error.name === 'AuthError') {
    return ERROR_MESSAGES.AuthError!
  }

  if (error.name === 'LexicalError' || error.message.includes('Lexical')) {
    return ERROR_MESSAGES.LexicalError!
  }

  if (
    error.name === 'NetworkError' ||
    error.message.includes('network') ||
    error.message.includes('fetch') ||
    error.message.includes('Failed to fetch')
  ) {
    return ERROR_MESSAGES.NetworkError!
  }

  if (
    error.name === 'DatabaseError' ||
    error.message.includes('database') ||
    error.message.includes('query') ||
    error.message.includes('ECONNREFUSED')
  ) {
    return ERROR_MESSAGES.DatabaseError!
  }

  if (context && context in ERROR_MESSAGES) {
    return ERROR_MESSAGES[context]!
  }

  return ERROR_MESSAGES.default!
}

export default function CustomError({
  error,
  reset,
  context = 'root'
}: CustomErrorProps) {
  const errorInfo = getErrorMessage(error, context)

  return (
    <aside className="w-full h-[calc(100vh-80px)] flex flex-col items-center justify-center p-16">
      <h2 className="text-lg text-center text-[#ff4512af] mb-4">
        {errorInfo.title}
      </h2>
      <p className="text-center mb-2 max-w-md">
        {errorInfo.message}
      </p>

      <div className="flex items-center justify-center gap-6 mt-10">
        <button
          onClick={reset}
          className="px-4 py-2 bg-[#ff4512] text-white rounded hover:bg-[#871717] transition-colors"
          aria-label={errorInfo.action}
        >
          {errorInfo.action}
        </button>
        <Link
          className="hover:text-[#871717] transition-colors"
          href="/#contact"
        >
          Kontakt
        </Link>
      </div>

      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-100 rounded text-sm text-gray-700 max-w-2xl w-full">
          <p className="font-bold mb-2 text-red-600">🔧 Debug Info (development only)</p>
          <div className="space-y-1">
            <p><strong>Context:</strong> {context}</p>
            <p><strong>Error Name:</strong> {error.name}</p>
            <p><strong>Message:</strong> {error.message}</p>
            {error.digest && <p><strong>Digest:</strong> {error.digest}</p>}
          </div>
          {error.stack && (
            <details className="mt-2">
              <summary className="cursor-pointer font-semibold hover:text-red-600">
                Stack Trace (click to expand)
              </summary>
              <pre className="mt-2 text-xs overflow-auto max-h-60 bg-white p-2 rounded border border-gray-300">
                {error.stack}
              </pre>
            </details>
          )}
        </div>
      )}
    </aside>
  )
}
