import { formatDate } from '@/helpers/formatDate'
import AddCommentButton from './AddCommentButton'
import DeleteCommentButton from './DeleteCommentButton'
import type { Comment } from '@/types/forumPostsTypes'

type Props = {
  postId: string
  comments: Comment[]
  userId: string | null
  isAuthor: boolean
  readonly: boolean
}

export default function ForumDetailComments({ postId, comments, userId, isAuthor, readonly }: Props) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm xs:text-lg font-semibold text-zinc-100">
          Komentarze ({comments.length})
          {readonly && <span className="text-zinc-500 text-sm ml-2">(Komentarze wyłączone)</span>}
        </h2>
        {!readonly && <AddCommentButton postId={postId} />}
      </div>

      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-zinc-800/50 rounded-lg p-4 hover:bg-zinc-800 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <span className="font-medium text-zinc-300">{comment.authorName}</span>
                <span>•</span>
                <time>{formatDate(comment.createdAt)}</time>
              </div>
              {!readonly && (isAuthor || userId === comment.authorId) && (
                <DeleteCommentButton postId={postId} commentId={comment.id} authorId={comment.authorId} />
              )}
            </div>
            <p className="text-zinc-300 text-sm leading-relaxed">{comment.content}</p>
          </div>
        ))}

        {comments.length === 0 && (
          <p className="text-center text-zinc-500 py-4">
            {readonly ? 'Ten post nie ma komentarzy' : 'Bądź pierwszym który skomentuje ten post'}
          </p>
        )}
      </div>
    </div>
  )
}
