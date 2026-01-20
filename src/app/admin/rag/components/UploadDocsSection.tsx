'use client'

import { useActionState } from 'react'
import { uploadMedicalDocsAction } from '@/actions/admin-rag-actions'
import { SubmitButton } from '@/components/SubmitButton'
import { EMPTY_FORM_STATE } from '@/types/actionTypes'

interface UploadDocsSectionProps {
  storeName: string
}

export default function UploadDocsSection({ storeName }: UploadDocsSectionProps) {
  const [formState, action] = useActionState(uploadMedicalDocsAction, EMPTY_FORM_STATE)

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-200">
      <h2 className="text-xl font-semibold text-zinc-900 mb-4">
        Prześlij Dokumenty Medyczne
      </h2>
      <p className="text-zinc-600 mb-6">
        Prześlij wszystkie pliki .md z katalogu <code className="px-2 py-1 bg-zinc-100 rounded text-sm">/docs</code> do File Search Store
      </p>

      <form action={action} className="space-y-4">
        <input type="hidden" name="storeName" value={storeName} />

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Uwaga:</span> Ta operacja może potrwać kilka minut. Dokumenty będą przesyłane jeden po drugim.
          </p>
        </div>

        <SubmitButton className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
          Prześlij Wszystkie Dokumenty
        </SubmitButton>

        {/* Success Message */}
        {formState.status === 'SUCCESS' && formState.data && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-2">
            <p className="text-sm font-medium text-green-800">
              ✓ {formState.message}
            </p>
            {formState.data.uploaded && formState.data.uploaded.length > 0 && (
              <div>
                <p className="text-xs font-medium text-green-700 mb-1">
                  Przesłane dokumenty:
                </p>
                <div className="flex flex-wrap gap-1">
                  {formState.data.uploaded.map((doc: string) => (
                    <span
                      key={doc}
                      className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs"
                    >
                      {doc}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {formState.data.failed && formState.data.failed.length > 0 && (
              <div>
                <p className="text-xs font-medium text-red-700 mb-1">
                  Błędy przesyłania:
                </p>
                <div className="flex flex-wrap gap-1">
                  {formState.data.failed.map((doc: string) => (
                    <span
                      key={doc}
                      className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs"
                    >
                      {doc}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {formState.status === 'ERROR' && formState.message && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{formState.message}</p>
            {formState.data?.failed && formState.data.failed.length > 0 && (
              <div className="mt-2">
                <p className="text-xs font-medium text-red-700 mb-1">
                  Nie udało się przesłać:
                </p>
                <div className="flex flex-wrap gap-1">
                  {formState.data.failed.map((doc: string) => (
                    <span
                      key={doc}
                      className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs"
                    >
                      {doc}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  )
}
