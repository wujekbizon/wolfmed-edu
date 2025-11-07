'use client'

import Link from 'next/link'
import { useDashboardStore } from '@/store/useDashboardStore'
import { formatDate } from '@/helpers/formatDate'
import NoteDeleteButton from './NoteDeleteButton'
import NoteDeleteModal from './NoteDeleteModal'
import type { NotesType } from '@/types/notesTypes'

interface NotePreviewCardProps {
    note: NotesType
}

export default function NotePreviewCard({ note }: NotePreviewCardProps) {
    const { isDeleteModalOpen, noteIdToDelete } = useDashboardStore()

    return (
        <div className="relative group bg-white border border-zinc-200 rounded-2xl shadow-sm hover:shadow-md hover:border-zinc-300 transition-all duration-300"
        >
            {isDeleteModalOpen && noteIdToDelete === note.id && <NoteDeleteModal noteId={note.id} />}
            <Link
                href={`/panel/nauka/notatki/${note.id}`}
                className="block p-5 rounded-2xl"
            >
                <div className="flex justify-between items-start mb-3">
                    <h3 className="text-zinc-800 font-semibold text-lg leading-tight line-clamp-1">
                        {note.title || 'Bez tytułu'}
                    </h3>
                    {note.category && (
                        <span className="text-xs font-medium px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-300/60">
                            {note.category}
                        </span>
                    )}
                </div>
                <p className="text-zinc-600 text-sm leading-relaxed mb-4 line-clamp-3">
                    {note.excerpt || note.plainText || 'Brak treści'}
                </p>
                <div className="flex justify-between items-center text-xs text-zinc-600 mb-4">
                    <p>
                        Utworzono: <span className='font-semibold'>{formatDate(note.createdAt)}</span>
                    </p>
                    <p>
                        Aktualizacja: <span className='font-semibold'>{formatDate(note.updatedAt)}</span>
                    </p>
                </div>
            </Link>
            <div className="absolute bottom-2 right-3 z-10">
                <NoteDeleteButton noteId={note.id} />
            </div>
        </div>
    )
}
