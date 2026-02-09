'use client'

import { useActionState } from 'react'
import { deleteFileSearchStoreAction } from '@/actions/admin-rag-actions'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import { useToastMessage } from '@/hooks/useToastMessage'
import SubmitButton from '@/components/SubmitButton'

interface StoreStatusCardProps {
  isConfigured: boolean
  storeName: string | null
  storeDisplayName?: string | undefined
  documentCount: number
}

export default function StoreStatusCard({
  isConfigured,
  storeName,
  storeDisplayName,
  documentCount,
}: StoreStatusCardProps) {
  const [state, action] = useActionState(deleteFileSearchStoreAction,EMPTY_FORM_STATE)
  
  const noScriptFallback = useToastMessage(state)
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-zinc-900 mb-2">
            Status File Search Store
          </h2>

          {isConfigured ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">
                  Skonfigurowany
                </span>
              </div>

              <div className="space-y-2 text-sm text-zinc-600">
                {storeDisplayName && (
                  <div>
                    <span className="font-medium">Nazwa wyświetlana:</span>{' '}
                    {storeDisplayName}
                  </div>
                )}
                <div>
                  <span className="font-medium">Store Name:</span>
                  <code className="ml-2 px-2 py-1 bg-zinc-100 rounded text-xs font-mono">
                    {storeName}
                  </code>
                </div>
                <div>
                  <span className="font-medium">Dokumenty:</span>{' '}
                  {documentCount} plików
                </div>
              </div>

              <form action={action} className="mt-4">
                <SubmitButton
                  label="Usuń Store"
                  loading="Usuwam..."
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:bg-red-300 disabled:cursor-not-allowed"
                />
              </form>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium text-yellow-700">
                  Nie skonfigurowany
                </span>
              </div>

              <p className="text-sm text-zinc-600">
                File Search Store nie został jeszcze utworzony. Użyj poniższego
                formularza, aby utworzyć nowy store i przesłać dokumenty
                medyczne.
              </p>
            </div>
          )}
        </div>

        <div
          className={`w-16 h-16 rounded-lg flex items-center justify-center ${
            isConfigured
              ? 'bg-green-100'
              : 'bg-yellow-100'
          }`}
        >
          <svg
            className={`w-8 h-8 ${
              isConfigured ? 'text-green-600' : 'text-yellow-600'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"
            />
          </svg>
        </div>
      </div>
      {noScriptFallback}
    </div>
  )
}
