import { formatDate } from '@/helpers/formatDate'
import { Comment } from '@/types/forumPostsTypes'
import DeleteCommentButton from './DeleteCommentButton'

type Props = {
  comments: Comment[]
  postId: string
  visibleCount: number
  isAuthor: boolean
  userId: string
  onShowMore: (e: React.MouseEvent) => void
  totalCount: number
}

export default function ForumPostComments({
  comments,
  postId,
  visibleCount,
  isAuthor,
  userId,
  onShowMore,
  totalCount,
}: Props) {
  return (
    <div className="mt-4 space-y-4 pl-6 border-l border-zinc-800">
      {comments.map((comment) => (
        <div key={comment.id} className="text-sm space-y-2">
          <div className="flex flex-wrap items-center justify-between">
            <div className="flex items-center justify-center gap-2 text-zinc-500">
              <span className="font-medium truncate max-w-[120px] sm:max-w-none">{comment.authorName}</span>
              <span>/</span>
              <time>{formatDate(comment.createdAt)}</time>
              {(isAuthor || userId === comment.authorId) && (
                <DeleteCommentButton postId={postId} commentId={comment.id} authorId={comment.authorId} />
              )}
            </div>
          </div>
          <p className="text-zinc-400 leading-relaxed">{comment.content}</p>
        </div>
      ))}

      {visibleCount < totalCount && (
        <button onClick={onShowMore} className="text-sm text-red-400 hover:text-red-300 transition-colors mt-2">
          Pokaż więcej komentarzy ({totalCount - visibleCount})
        </button>
      )}
    </div>
  )
}
