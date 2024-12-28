import ProgressIcon from './icons/ProgressIcon'
import AddCommentButton from './AddCommentButton'
import DeletePostButton from './DeletePostButton'

type Props = {
  postId: string
  authorId: string
  isAuthor: boolean
  commentCount: number
  showComments: boolean
  onToggleComments: () => void
}

export default function ForumPostActions({
  postId,
  authorId,
  isAuthor,
  commentCount,
  showComments,
  onToggleComments,
}: Props) {
  return (
    <div className="flex flex-col-reverse xs:flex-row xs:items-center gap-4 xs:justify-between">
      <button
        onClick={onToggleComments}
        className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        <ProgressIcon height={24} width={24} />
        <span>{commentCount} komentarzy</span>
        {commentCount > 0 && <span className="text-xs">{showComments ? '▼' : '▶'}</span>}
      </button>

      <div className="flex items-center gap-3 text-sm justify-between">
        <AddCommentButton postId={postId} />
        {isAuthor && <DeletePostButton postId={postId} authorId={authorId} />}
      </div>
    </div>
  )
}
