import { lexicalToHtml } from '@/helpers/lexicalToHtml'
import { sanitizeHtml } from '@/helpers/sanitizeHtml'

interface Props {
  content: string
  className?: string
  preview?: boolean
}

export default function RichTextContent({ content, className = '', preview = false }: Props) {
  return (
    <div
      className={`
        ${preview ? 'line-clamp-3 text-ellipsis' : ''} 
        ${className}
      `}
      style={{
        wordBreak: 'break-word',
        whiteSpace: preview ? 'normal' : 'pre-wrap',
        overflowWrap: 'break-word',
      }}
      dangerouslySetInnerHTML={{
        __html: lexicalToHtml(sanitizeHtml(content)),
      }}
    />
  )
}
