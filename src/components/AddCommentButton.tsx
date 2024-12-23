'use client'

import { useState } from 'react'
import CreateCommentForm from './CreateCommentForm'

type Props = {
  postId: string
}

export default function AddCommentButton({ postId }: Props) {
  const [isFormOpen, setIsFormOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsFormOpen(true)}
        className="text-zinc-500 hover:text-zinc-300 transition-colors flex items-center justify-center gap-1"
      >
        <span className="text-lg">+</span>
        <span>Dodaj komentarz</span>
      </button>

      {isFormOpen && <CreateCommentForm postId={postId} onClose={() => setIsFormOpen(false)} />}
    </>
  )
}
