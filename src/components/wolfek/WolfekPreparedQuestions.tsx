'use client'

import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import Button from '@/components/ui/Button'
import questions from '@/content/wolfek/questions.json'
import type { WolfekRoute } from '@/types/wolfekResponseTypes'

export default function WolfekPreparedQuestions({ route, pending, onSelect, questionIds, activeId }: {
  route: WolfekRoute; pending: boolean; onSelect: (id: string) => void; questionIds?: string[]; activeId?: string
}) {
  const [expanded, setExpanded] = useState(false)
  const available = questions[route].filter((item) => !item.conditional && (!questionIds || questionIds.includes(item.id)))
  const ordered = [...available.filter((item) => item.featured), ...available.filter((item) => !item.featured)]
  const featured = ordered.slice(0, 5)
  const extra = ordered.slice(5)
  return <div className="panel-wolfek-topic-picker">
    <p className="panel-wolfek-topics-label">Wybierz pytanie</p>
    <div className="panel-wolfek-topics">
      {[...featured, ...(expanded ? extra : [])].map((item) =>
        <Button key={item.id} type="button" variant="secondary" size="sm" disabled={pending}
          aria-pressed={activeId ? activeId === item.id : undefined}
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
