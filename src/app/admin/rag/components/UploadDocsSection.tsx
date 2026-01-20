'use client'

import { useActionState } from 'react'
import { uploadMedicalDocsAction } from '@/actions/admin-rag-actions'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import SubmitButton from '@/components/SubmitButton'
import { useToastMessage } from '@/hooks/useToastMessage'

interface UploadDocsSectionProps {
  storeName: string
}

export default function UploadDocsSection({ storeName }: UploadDocsSectionProps) {
  const [state, action] = useActionState(uploadMedicalDocsAction, EMPTY_FORM_STATE)
  const noScriptFallback = useToastMessage(state)

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

        <SubmitButton label="Prześlij Wszystkie Dokumenty" loading="Przesyłanie..." className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors" />
        {noScriptFallback}
      </form>
    </div>
  )
}
