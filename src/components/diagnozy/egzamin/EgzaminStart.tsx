'use client'

import { LoaderCircle, Play } from 'lucide-react'

export default function EgzaminStart({
  loading,
  onStart,
}: {
  loading: boolean
  onStart: () => void
}) {
  return (
    <div className="flex flex-col items-start gap-3">
      <button
        type="button"
        onClick={onStart}
        disabled={loading}
        className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-xl
          text-white bg-rose-500 hover:bg-rose-600 cursor-pointer transition-all
          shadow-[0_10px_22px_-10px_rgba(244,63,94,0.9)]
          disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none"
      >
        {loading ? (
          <LoaderCircle className="w-4 h-4 animate-spin" />
        ) : (
          <Play className="w-4 h-4" />
        )}
        Rozpocznij egzamin
      </button>
    </div>
  )
}
