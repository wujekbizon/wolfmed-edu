'use client'

import { useTopPanelStore } from '@/store/useTopPanelStore'
import Link from 'next/link'
import type { NotesType } from '@/types/notesTypes'

interface PinnedNotePreviewProps {
  note: NotesType
}

export default function PinnedNotePreview({ note }: PinnedNotePreviewProps) {
  const setExpandedNote = useTopPanelStore((state) => state.setExpandedNote)

  const handleClose = () => {
    setExpandedNote(null)
  }

  return (
    <div className="mt-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-zinc-200/60 shadow-lg">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <h3 className="text-base font-bold text-slate-900 mb-1">
            {note.title || 'Bez tytułu'}
          </h3>
          {note.category && (
            <span className="inline-block px-3 py-1 text-xs font-medium bg-zinc-100 text-zinc-700 rounded-full border border-zinc-200">
              {note.category}
            </span>
          )}
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-zinc-500 hover:text-zinc-800 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="min-h-[200px] max-h-[400px] overflow-y-auto scrollbar-webkit mb-4 p-3 bg-zinc-50/50 rounded-lg border border-zinc-200/40">
        <p className="text-sm text-zinc-800 whitespace-pre-wrap leading-relaxed">
          {note.plainText || note.excerpt || 'Brak treści'}
        </p>
      </div>

      <Link
        href={`/panel/nauka/notatki/${note.id}`}
        className="inline-block px-4 py-2 bg-[#ff9898] text-white rounded-full text-sm font-medium hover:bg-[#f58a8a] transition-colors"
      >
        Zobacz pełną notatkę
      </Link>
    </div>
  )
}
