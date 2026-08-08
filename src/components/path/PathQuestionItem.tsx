import type { PathQuestion } from '@/types/pathStoryTypes'

export default function PathQuestionItem({
  item,
  index,
  active
}: {
  item: PathQuestion
  index: number
  active: boolean
}) {
  return (
    <div className='scene-reveal flex items-baseline gap-4' data-active={active ? 'true' : 'false'}>
      <span
        className={`font-mono text-[11px] leading-none transition-colors duration-300 ${
          active ? 'text-rose-500' : 'text-zinc-100/35'
        }`}
      >
        {String(index + 1).padStart(2, '0')}
      </span>

      <div>
        <dt className='text-base font-semibold leading-snug text-zinc-50'>
          {item.question}
        </dt>
        <dd className='mt-1.5 text-[13.5px] leading-relaxed text-zinc-100/60 text-pretty'>
          {item.answer}
        </dd>
      </div>
    </div>
  )
}
