import type { GeneratedQuestion } from '@/types/aiTestTypes'

export default function AIQuestionPreviewCard(props: {
  question: GeneratedQuestion
  index: number
}) {
  const { data } = props.question
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start gap-2">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-zinc-100">
          {props.index + 1}
        </span>
        <h4 className="text-sm font-semibold text-zinc-900">{data.question}</h4>
      </div>
      <ul className="space-y-1.5">
        {data.answers.map((answer, i) => (
          <li
            key={i}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
              answer.isCorrect
                ? 'bg-emerald-50 border border-emerald-200 text-zinc-800'
                : 'bg-zinc-50 text-zinc-600'
            }`}
          >
            <span className={answer.isCorrect ? 'text-emerald-700 font-semibold' : 'text-zinc-400'}>
              {String.fromCharCode(65 + i)}.
            </span>
            <span>{answer.option}</span>
            {answer.isCorrect && (
              <span className="ml-auto text-xs font-semibold text-emerald-700">✓ Poprawna</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
