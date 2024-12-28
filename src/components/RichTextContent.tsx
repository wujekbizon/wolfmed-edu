import { lexicalToHtml } from '@/helpers/lexicalToHtml'
import { sanitizeHtml } from '@/helpers/sanitizeHtml'

interface Props {
  content: string
  className?: string
}

export default function RichTextContent({ content, className = '' }: Props) {
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{
        __html: lexicalToHtml(sanitizeHtml(content)),
      }}
    />
  )
}
