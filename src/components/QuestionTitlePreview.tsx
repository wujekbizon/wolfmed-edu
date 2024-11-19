interface Props {
  question: string
}

export default function QuestionTitlePreview({ question }: Props) {
  return (
    <div className="h-[80px] overflow-y-auto scrollbar-webkit">
      <p className="text-sm text-zinc-700 pr-2">{question}</p>
    </div>
  )
}
