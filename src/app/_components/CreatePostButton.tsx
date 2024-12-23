'use client'

import { useState } from 'react'
import CreatePostForm from '../_components/CreatePostForm'

export default function CreatePostButton() {
  const [isFormOpen, setIsFormOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsFormOpen(true)}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
      >
        Nowy post
      </button>

      {isFormOpen && <CreatePostForm onClose={() => setIsFormOpen(false)} />}
    </>
  )
}
