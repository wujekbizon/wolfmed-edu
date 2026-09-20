'use client'

import ForumSearch from '@/components/ForumSearch'
import ForumSort from '@/components/ForumSort'
import { useForumSearchStore } from '@/store/useForumSearch'

export default function ForumToolbar() {
  const { searchTerm, setSearchTerm, sortOption, setSortOption } = useForumSearchStore()

  return (
    <div className="rounded-b-lg bg-zinc-800 px-4 py-3 xs:px-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <ForumSearch searchTerm={searchTerm} onSearch={setSearchTerm} />
        <ForumSort sortOption={sortOption} onSort={setSortOption} />
      </div>
    </div>
  )
}
