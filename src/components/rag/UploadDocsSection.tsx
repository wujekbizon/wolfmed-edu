'use client'

import { useActionState, useState, useRef } from 'react'
import { uploadFilesAction } from '@/actions/admin-rag-actions'
import { EMPTY_FORM_STATE } from '@/constants/formState'
import SubmitButton from '@/components/SubmitButton'
import { useToastMessage } from '@/hooks/useToastMessage'

interface UploadDocsSectionProps {
  storeName: string
}

export default function UploadDocsSection({ storeName }: UploadDocsSectionProps) {
  const [state, action] = useActionState(uploadFilesAction, EMPTY_FORM_STATE)
  const noScriptFallback = useToastMessage(state)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    setSelectedFiles(files)

    if (fileInputRef.current && e.dataTransfer.files) {
      fileInputRef.current.files = e.dataTransfer.files
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setSelectedFiles(files)
    }
  }

  const handleRemoveFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)

    if (fileInputRef.current) {
      const dt = new DataTransfer()
      newFiles.forEach(file => dt.items.add(file))
      fileInputRef.current.files = dt.files
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-zinc-200">
      <h2 className="text-xl font-semibold text-zinc-900 mb-4">
        Prześlij Dokumenty
      </h2>
      <p className="text-zinc-600 mb-6">
        Wybierz pliki (.md, .txt, .pdf) do przesłania do File Search Store
      </p>

      <form action={action} className="space-y-4">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-zinc-300 bg-zinc-50 hover:border-zinc-400'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            name="files"
            multiple
            accept=".md,.txt,.pdf"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <div className="pointer-events-none">
            <svg
              className="mx-auto h-12 w-12 text-zinc-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="mt-4 text-sm text-zinc-600">
              <span className="font-semibold text-blue-600">Kliknij aby wybrać pliki</span>
              {' '}lub przeciągnij i upuść
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Obsługiwane formaty: MD, TXT, PDF
            </p>
          </div>
        </div>

        {selectedFiles.length > 0 && (
          <div className="bg-zinc-50 rounded-lg p-4 border border-zinc-200">
            <h3 className="text-sm font-medium text-zinc-900 mb-2">
              Wybrane pliki ({selectedFiles.length})
            </h3>
            <ul className="space-y-2">
              {selectedFiles.map((file, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between bg-white px-3 py-2 rounded border border-zinc-200"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <svg
                      className="w-4 h-4 text-zinc-400 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span className="text-sm text-zinc-700 truncate">{file.name}</span>
                    <span className="text-xs text-zinc-500 shrink-0">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="ml-2 text-red-600 hover:text-red-800 shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Uwaga:</span> Ta operacja może potrwać kilka minut. Pliki będą przesyłane jeden po drugim.
          </p>
        </div>

        <SubmitButton
          label="Prześlij Pliki"
          loading="Przesyłanie..."
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:bg-blue-300"
          disabled={selectedFiles.length === 0}
        />
        {noScriptFallback}
      </form>
    </div>
  )
}
