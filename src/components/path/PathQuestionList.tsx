'use client'

import { useSceneReveal } from '@/hooks/useSceneReveal'
import PathQuestionItem from './PathQuestionItem'
import type { PathQuestion } from '@/types/pathStoryTypes'

export default function PathQuestionList({ items }: { items: PathQuestion[] }) {
  const { active, setScene } = useSceneReveal(items.length, true)

  return (
    <dl className='mt-8 border-t border-zinc-100/15'>
      {items.map((item, index) => (
        <div
          key={item.question}
          ref={setScene(index)}
          className='border-b border-zinc-100/15 py-4'
        >
          <PathQuestionItem
            item={item}
            index={index}
            active={active[index] ?? false}
          />
        </div>
      ))}
    </dl>
  )
}
