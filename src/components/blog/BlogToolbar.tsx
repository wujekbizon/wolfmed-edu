'use client'

import BlogSearch from '@/components/BlogSearch'
import BlogSort from '@/components/BlogSort'
import { useBlogSearchStore } from '@/store/useBlogSearch'

export default function BlogToolbar() {
  const { searchTerm, setSearchTerm } = useBlogSearchStore()

  return (
    <div className="mb-8 flex w-full flex-col items-center justify-between gap-4 sm:flex-row sm:gap-8">
      <div className="flex w-full">
        <BlogSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      </div>
      <BlogSort />
    </div>
  )
}
