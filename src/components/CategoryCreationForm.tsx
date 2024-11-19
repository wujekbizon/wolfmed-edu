'use client'

import { useState } from 'react'
import { useQuestionSelectionStore } from '@/store/useQuestionSelectionStore'

export default function CategoryCreationForm() {
  const [newCategoryName, setNewCategoryName] = useState('')
  const { createCategory } = useQuestionSelectionStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newCategoryName.trim()) {
      createCategory(newCategoryName.trim())
      setNewCategoryName('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
      <input
        type="text"
        value={newCategoryName}
        onChange={(e) => setNewCategoryName(e.target.value)}
        maxLength={40}
        placeholder="Nazwa nowej kategorii..."
        className="w-full h-9 sm:h-10 rounded-lg border border-zinc-600/20 bg-white/80 px-2 sm:px-3 focus:outline-none focus:ring-2 focus:ring-red-300/20 focus:border-zinc-800/50"
      />
      <button
        type="submit"
        className="h-9 sm:h-10 w-full sm:w-auto rounded-lg bg-[#ffc5c5]/70 backdrop-blur-sm px-3 sm:px-4 text-zinc-800 hover:bg-[#f58a8a]/70 transition-colors border border-red-100/20 hover:border-zinc-900/10 shadow-sm whitespace-nowrap"
      >
        Dodaj
      </button>
    </form>
  )
}
