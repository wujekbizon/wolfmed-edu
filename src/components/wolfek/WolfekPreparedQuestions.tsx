'use client'

import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import questions from '@/content/wolfek/questions.json'
import type { WolfekRoute } from '@/types/wolfekResponseTypes'

export default function WolfekPreparedQuestions({ route, pending, onSelect }: {
  route: WolfekRoute; pending: boolean; onSelect: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const featured = questions[route].filter((item) => item.featured && !item.conditional)
  const extra = questions[route].filter((item) => !item.featured && !item.conditional)
  return <div className="panel-wolfek-topic-picker">
    <div className="panel-wolfek-topics">
      {[...featured, ...(expanded ? extra : [])].map((item) =>
        <Button key={item.id} type="button" variant="secondary" size="sm" disabled={pending}
          className="practice-orbit-action panel-wolfek-topic" onClick={() => onSelect(item.id)}>
          <span aria-hidden="true"><MessageCircle size={17} /></span><span>{item.prompt}</span>
        </Button>)}
    </div>
    {extra.length > 0 && <Button variant="ghost" size="sm" disabled={pending}
      aria-expanded={expanded} onClick={() => setExpanded((value) => !value)}>
      {expanded ? 'Mniej pytań' : 'Więcej pytań'}
    </Button>}
  </div>
}
