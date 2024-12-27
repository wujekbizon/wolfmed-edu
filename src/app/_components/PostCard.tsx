'use client'

import { Post } from '@/types/forumPostsTypes'
import { formatDate } from '@/helpers/formatDate'
import Link from 'next/link'
import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import DeletePostButton from '@/components/DeletePostButton'
import ProgressIcon from '@/components/icons/ProgressIcon'
import AddCommentButton from '@/components/AddCommentButton'
import DeleteCommentButton from '@/components/DeleteCommentButton'

const COMMENTS_PER_PAGE = 3

export default function PostCard({ post }: { post: Post }) {
  const [showComments, setShowComments] = useState(false)
  const [displayedComments, setDisplayedComments] = useState(COMMENTS_PER_PAGE)
  const { user } = useUser()

  const commentCount = post.comments.length
  const isAuthor = user?.id === post.authorId

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
  }

  const handleShowMore = (e: React.MouseEvent) => {
    e.preventDefault()
    setDisplayedComments((prev) => Math.min(prev + COMMENTS_PER_PAGE, commentCount))
  }

  const visibleComments = post.comments.slice(0, displayedComments)

  return (
    <article className="bg-zinc-900 rounded-lg p-4 xs:p-6 hover:bg-zinc-950 transition-colors group">
      <Link href={`/forum/${post.id}`}>
        <h2 className="text-xl font-semibold text-zinc-100 mb-3 group-hover:text-zinc-50">{post.title}</h2>
        <p className="text-zinc-400 mb-4">{truncateText(post.content, 150)}</p>
      </Link>

      <div className="flex items-center text-sm text-zinc-500 mb-4">
        <span className="truncate max-w-[120px] sm:max-w-none">{post.authorName}</span>
        <span className="mx-2">/</span>
        <time>{formatDate(post.createdAt)}</time>
      </div>

      <div className="border-t border-zinc-800 pt-4">
        <div className="flex flex-col-reverse xs:flex-row xs:items-center gap-4 xs:justify-between">
          <button
            onClick={(e) => {
              e.preventDefault()
              setShowComments(!showComments)
              if (!showComments) {
                setDisplayedComments(COMMENTS_PER_PAGE)
              }
            }}
            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <ProgressIcon height={24} width={24} />
            <span>{commentCount} komentarzy</span>
            {commentCount > 0 && <span className="text-xs">{showComments ? '▼' : '▶'}</span>}
          </button>

          <div className="flex items-center gap-3 text-sm justify-between">
            <AddCommentButton postId={post.id} />
            {isAuthor && <DeletePostButton postId={post.id} authorId={post.authorId} />}
          </div>
        </div>

        {showComments && commentCount > 0 && (
          <div className="mt-4 space-y-4 pl-6 border-l border-zinc-800">
            {visibleComments.map((comment) => (
              <div key={comment.id} className="text-sm space-y-2">
                <div className="flex flex-wrap items-center justify-between">
                  <div className="flex items-center justify-center gap-2 text-zinc-500">
                    <span className="font-medium truncate max-w-[120px] sm:max-w-none">{comment.authorName}</span>
                    <span>/</span>
                    <time>{formatDate(comment.createdAt)}</time>
                    {(isAuthor || user?.id === comment.authorId) && (
                      <DeleteCommentButton postId={post.id} commentId={comment.id} authorId={comment.authorId} />
                    )}
                  </div>
                </div>
                <p className="text-zinc-400 leading-relaxed">{comment.content}</p>
              </div>
            ))}

            {displayedComments < commentCount && (
              <button
                onClick={handleShowMore}
                className="text-sm text-red-400 hover:text-red-300 transition-colors mt-2"
              >
                Pokaż więcej komentarzy ({commentCount - displayedComments})
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
