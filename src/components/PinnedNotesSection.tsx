'use client'

import PinnedNoteCard from './PinnedNoteCard'
import type { NotesType } from '@/types/notesTypes'

interface PinnedNotesSectionProps {
  pinnedNotes: NotesType[]
}

export default function PinnedNotesSection({ pinnedNotes }: PinnedNotesSectionProps) {
  if (!pinnedNotes || pinnedNotes.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-100 mb-4">
          <svg className="w-8 h-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </div>
        <p className="text-sm text-zinc-600 max-w-xs mx-auto">
          Nie masz przypiętych notatek. Przypnij notatki, aby mieć do nich szybki dostęp.
        </p>
      </div>
    )
  }

  return (
    <div className="pr-3 pl-6 py-6 max-h-[70vh] overflow-y-auto scrollbar-webkit">
      <div className="space-y-3">
        {pinnedNotes.map((note, index) => (
          <PinnedNoteCard
            key={note.id}
            note={note}
            index={index}
          />
        ))}
      </div>
    </div>
  )
}
