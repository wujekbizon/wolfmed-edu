'use client'

import { Post } from '@/types/forumPostsTypes'
import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import ForumPostHeader from './ForumPostHeader'
import ForumPostActions from './ForumPostActions'
import ForumPostComments from './ForumPostComments'

const COMMENTS_PER_PAGE = 3

export default function ForumPostCard({ post }: { post: Post }) {
  const [showComments, setShowComments] = useState(false)
  const [displayedComments, setDisplayedComments] = useState(COMMENTS_PER_PAGE)
  const { user } = useUser()

  const commentCount = post.comments.length
  const isAuthor = user?.id === post.authorId

  const handleShowMore = (e: React.MouseEvent) => {
    e.preventDefault()
    setDisplayedComments((prev) => Math.min(prev + COMMENTS_PER_PAGE, commentCount))
  }

  const visibleComments = post.comments.slice(0, displayedComments)

  return (
    <article className="bg-zinc-900 rounded-lg p-4 xs:p-6 hover:bg-zinc-950 transition-colors group">
      <ForumPostHeader
        id={post.id}
        title={post.title}
        content={post.content}
        authorName={post.authorName}
        createdAt={post.createdAt}
      />

      <div className="border-t border-zinc-800 pt-4">
        <ForumPostActions
          postId={post.id}
          authorId={post.authorId}
          isAuthor={isAuthor}
          commentCount={commentCount}
          showComments={showComments}
          onToggleComments={() => {
            setShowComments(!showComments)
            if (!showComments) {
              setDisplayedComments(COMMENTS_PER_PAGE)
            }
          }}
        />

        {showComments && commentCount > 0 && user?.id && (
          <ForumPostComments
            comments={visibleComments}
            postId={post.id}
            visibleCount={displayedComments}
            isAuthor={isAuthor}
            userId={user.id}
            onShowMore={handleShowMore}
            totalCount={commentCount}
          />
        )}
      </div>
    </article>
  )
}
