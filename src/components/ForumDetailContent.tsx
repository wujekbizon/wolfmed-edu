import RichTextContent from './RichTextContent'

type Props = {
  content: string
}

export default function ForumDetailContent({ content }: Props) {
  return (
    <div className="p-6 border-b border-zinc-800">
      <div className="prose prose-invert max-w-none">
        <RichTextContent content={content} className="text-zinc-300" />
      </div>
    </div>
  )
}
