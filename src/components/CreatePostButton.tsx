'use client'

import { useState } from 'react'
import CreatePostForm from './CreatePostForm'
import AddPostIcon from '@/components/icons/AddPostIcon'

export default function CreatePostButton() {
  const [isFormOpen, setIsFormOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsFormOpen(true)}
        className="group flex items-center gap-2 bg-gradient-to-r from-[#f58a8a]/90 to-[#ffc5c5]/90 hover:from-[#f58a8a] hover:to-[#ffc5c5] text-white px-2 py-1 rounded-lg transition-all duration-200 "
      >
        <AddPostIcon width={26} height={26} color="#554a4a" />
        <span className="font-semibold text-lg text-zinc-950">Dodaj temat</span>
      </button>

      {isFormOpen && <CreatePostForm onClose={() => setIsFormOpen(false)} />}
    </>
  )
}
