'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import questions from '@/content/wolfek/questions.json'
import type { WolfekRoute } from '@/types/wolfekResponseTypes'
import WolfekPreparedQuestionButton from './WolfekPreparedQuestionButton'

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
      {featured.map((question) => <WolfekPreparedQuestionButton key={question.id}
        question={question} pending={pending} onSelect={onSelect} active={activeId === question.id} />)}
    </div>
    {expanded && extra.length > 0 && <div className="panel-wolfek-extra-topics" role="group" aria-label="Dodatkowe pytania">
      {extra.map((question) => <WolfekPreparedQuestionButton key={question.id}
        question={question} pending={pending} onSelect={onSelect} active={activeId === question.id} />)}
    </div>}
    {extra.length > 0 && <Button variant="ghost" size="sm" disabled={pending}
      aria-expanded={expanded} onClick={() => setExpanded((value) => !value)}>
      {expanded ? 'Mniej pytań' : 'Więcej pytań'}
    </Button>}
  </div>
}
