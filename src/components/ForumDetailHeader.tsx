import { formatDate } from '@/helpers/formatDate'
import DeletePostButton from './DeletePostButton'

type Props = {
  title: string
  authorName: string
  createdAt: string
  isAuthor: boolean
  postId: string
}

export default function ForumDetailHeader({ title, authorName, createdAt, isAuthor, postId }: Props) {
  return (
    <div className="p-6 border-b border-zinc-800">
      <div className="flex justify-between items-start">
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100 mb-4">{title}</h1>
      </div>
      <div className="flex items-center justify-between gap-4 text-sm text-zinc-500">
        <div className="flex items-center gap-2">
          <span>{authorName}</span>
          <span>•</span>
          <time>{formatDate(createdAt)}</time>
        </div>
        {isAuthor && <DeletePostButton postId={postId} />}
      </div>
    </div>
  )
}
