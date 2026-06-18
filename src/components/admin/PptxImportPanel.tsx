'use client'

import { useRef, useState } from 'react'
import { importPptxAction, type ImportPptxResult } from '@/actions/pptx'

interface PptxImportPanelProps {
  onImported: (data: NonNullable<ImportPptxResult['data']>) => void
}

export default function PptxImportPanel({ onImported }: PptxImportPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleImport() {
    const file = inputRef.current?.files?.[0]
    if (!file) {
      setError('Najpierw wybierz plik .pptx')
      return
    }

    setError('')
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const result = await importPptxAction(formData)
      if (result.success && result.data) {
        onImported(result.data)
        if (inputRef.current) inputRef.current.value = ''
        setFileName('')
      } else {
        setError(result.error || 'Nie udało się przetworzyć prezentacji')
      }
    } catch {
      setError('Wystąpił nieoczekiwany błąd podczas importu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-red-50 p-6 rounded-lg border border-red-200">
      <h2 className="text-lg font-semibold text-zinc-900 mb-1">
        Import z PowerPoint (opcjonalnie)
      </h2>
      <p className="text-sm text-zinc-600 mb-4">
        Wgraj prezentację .pptx, a jej treść i obrazy zostaną wyodrębnione i
        wypełnią formularz poniżej. Sprawdź i edytuj treść przed publikacją.
      </p>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <label className="inline-flex items-center px-4 py-2 bg-white border border-zinc-300 rounded-md cursor-pointer hover:bg-zinc-50 text-sm font-medium text-zinc-700">
          <input
            ref={inputRef}
            type="file"
            accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
            className="sr-only"
            onChange={(e) => {
              setFileName(e.target.files?.[0]?.name || '')
              setError('')
            }}
          />
          Wybierz plik .pptx
        </label>

        {fileName && (
          <span className="text-sm text-zinc-600 truncate max-w-xs">
            {fileName}
          </span>
        )}

        <button
          type="button"
          onClick={handleImport}
          disabled={loading || !fileName}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed sm:ml-auto"
        >
          {loading ? 'Przetwarzanie...' : 'Wyodrębnij treść'}
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  )
}
