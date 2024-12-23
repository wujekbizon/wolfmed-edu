'use client'

import { Post } from '@/types/forumPostsTypes'
import { formatDate } from '@/helpers/formatDate'
import Link from 'next/link'
import { useState } from 'react'

const COMMENTS_PER_PAGE = 3

export default function PostCard({ post }: { post: Post }) {
  const [showComments, setShowComments] = useState(false)
  const [displayedComments, setDisplayedComments] = useState(COMMENTS_PER_PAGE)
  const commentCount = post.comments.length

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
  }

  const handleShowMore = (e: React.MouseEvent) => {
    e.preventDefault()
    setDisplayedComments((prev) => Math.min(prev + COMMENTS_PER_PAGE, commentCount))
  }

  const visibleComments = post.comments.slice(0, displayedComments)
  const hasMoreComments = displayedComments < commentCount

  return (
    <article className="bg-zinc-900 rounded-lg p-6 hover:bg-zinc-950 transition-colors">
      <Link href={`/forum/${post.id}`}>
        <h2 className="text-xl font-semibold text-zinc-100 mb-2">{post.title}</h2>
        <p className="text-zinc-400 mb-4">{truncateText(post.content, 150)}</p>
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-zinc-800 pt-4 gap-2 sm:gap-0">
        <div className="flex items-center text-sm text-zinc-500">
          <span className="truncate max-w-[120px] sm:max-w-none">{post.authorName}</span>
          <span className="mx-2">/</span>
          <time>{formatDate(post.createdAt)}</time>
        </div>

        <button
          onClick={(e) => {
            e.preventDefault()
            setShowComments(!showComments)
            if (!showComments) {
              setDisplayedComments(COMMENTS_PER_PAGE) // Reset when opening comments
            }
          }}
          className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <span>{commentCount} komentarzy</span>
          {commentCount > 0 && <span className="text-xs">{showComments ? '▼' : '▶'}</span>}
        </button>
      </div>

      {showComments && commentCount > 0 && (
        <div className="mt-4 space-y-4 border-t border-zinc-800 pt-4">
          {visibleComments.map((comment) => (
            <div key={comment.id} className="text-sm space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-zinc-500">
                <span className="font-medium truncate max-w-[120px] sm:max-w-none">{comment.authorName}</span>
                <span>/</span>
                <time>{formatDate(comment.createdAt)}</time>
              </div>
              <p className="text-zinc-400 leading-relaxed">{comment.content}</p>
            </div>
          ))}

          {hasMoreComments && (
            <button
              onClick={handleShowMore}
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors mt-2"
            >
              Pokaż więcej komentarzy ({commentCount - displayedComments})
            </button>
          )}
        </div>
      )}
    </article>
  )
}
