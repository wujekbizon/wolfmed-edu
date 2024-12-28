import Link from 'next/link'
import { formatDate } from '@/helpers/formatDate'

type Props = {
  id: string
  title: string
  content: string
  authorName: string
  createdAt: string
}

export default function ForumPostHeader({ id, title, content, authorName, createdAt }: Props) {
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
  }

  return (
    <>
      <Link href={`/forum/${id}`}>
        <h2 className="text-xl font-semibold text-zinc-100 mb-3 group-hover:text-zinc-50">{title}</h2>
        <p className="text-zinc-400 mb-4">{truncateText(content, 150)}</p>
      </Link>

      <div className="flex items-center text-sm text-zinc-500 mb-4">
        <span className="truncate max-w-[120px] sm:max-w-none">{authorName}</span>
        <span className="mx-2">/</span>
        <time>{formatDate(createdAt)}</time>
      </div>
    </>
  )
}
