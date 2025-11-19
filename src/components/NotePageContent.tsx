'use client'

import { useState } from 'react'
import StudyViewer from './StudyViewer'
import EditNoteModal from './EditNoteModal'

interface NotePageContentProps {
  note: {
    id: string
    content: unknown
    plainText: string | null
    updatedAt: string
  }
}

export default function NotePageContent({ note }: NotePageContentProps) {
  const [showEditModal, setShowEditModal] = useState(false)

  return (
    <>
      <StudyViewer
        key={note.updatedAt}
        noteId={note.id}
        content={note.content}
        plainTextFallback={note.plainText}
        onEditClick={() => setShowEditModal(true)}
      />
      {showEditModal && (
        <EditNoteModal
          noteId={note.id}
          initialContent={note.content}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </>
  )
}
