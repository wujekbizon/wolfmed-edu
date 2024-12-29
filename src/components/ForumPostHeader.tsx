import Link from 'next/link'
import { formatDate } from '@/helpers/formatDate'
import RichTextContent from './RichTextContent'

type Props = {
  id: string
  title: string
  content: string
  authorName: string
  createdAt: string
}

export default function ForumPostHeader({ id, title, content, authorName, createdAt }: Props) {
  return (
    <>
      <Link href={`/forum/${id}`}>
        <h2 className="text-xl font-semibold text-zinc-100 mb-3 group-hover:text-zinc-50">{title}</h2>
        <RichTextContent content={content} preview={true} className="text-zinc-400 text-sm mt-2" />
      </Link>

      <div className="flex items-center text-sm text-red-400 mb-1 mt-4">
        <span className="truncate max-w-[120px] sm:max-w-none">{authorName}</span>
        <span className="mx-2">/</span>
        <time>{formatDate(createdAt)}</time>
      </div>
    </>
  )
}
