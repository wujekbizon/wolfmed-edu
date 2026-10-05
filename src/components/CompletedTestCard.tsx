'use client'

import { CalendarDays, ChevronRight, CircleCheck } from 'lucide-react'
import type { CompletedTest, CompletedTestCardProps } from '@/types/dataTypes'
import Link from 'next/link'
import CompletedTestDeleteButton from './CompletedTestDeleteButton'
import { useStore } from '@/store/useStore'
import CompletedTestDeleteModal from './CompletedTestDeleteModal'
import { getQuestionWord } from '@/helpers/textHelpers'

export default function CompletedTestCard({ completedTest, isWolfekTarget = false }: CompletedTestCardProps) {
  const { score, id, testResult, completedAt } = completedTest as CompletedTest
  const { isDeleteModalOpen, testIdToDelete } = useStore()
  const correctAnswersCount = testResult.filter((result) => result.answer).length
  const progress = testResult.length ? Math.min(100, Math.max(0, score / testResult.length * 100)) : 0

  return <article id={isWolfekTarget ? 'panel-results-history' : undefined} className="completed-result-card">
    {isDeleteModalOpen && testIdToDelete === id && <CompletedTestDeleteModal testId={id} />}
    <div className="completed-result-main">
      <div className="completed-result-copy">
        <p className="completed-result-eyebrow"><CircleCheck size={15} aria-hidden="true" /> Ukończony test</p>
        <h2>{correctAnswersCount} {getQuestionWord(correctAnswersCount)} z {testResult.length} poprawnych</h2>
        <p className="completed-result-date">
          <CalendarDays size={15} aria-hidden="true" />
          {completedAt ? new Date(completedAt).toLocaleDateString('pl-PL') : 'Brak daty'}
        </p>
      </div>
      <div className="completed-result-score" aria-label={`Wynik: ${score} z ${testResult.length}`}>
        <span>Twój wynik</span>
        <strong>{score}<small> / {testResult.length}</small></strong>
      </div>
    </div>
    <div className="completed-result-progress" role="progressbar" aria-label="Wynik testu"
      aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
      <span style={{ width: `${progress}%` }} />
    </div>
    <div className="completed-result-actions">
      <Link href={`/panel/wyniki/${id}`} className="completed-result-open">
        Zobacz szczegóły <ChevronRight size={17} aria-hidden="true" />
      </Link>
      <CompletedTestDeleteButton testId={id} />
    </div>
  </article>
}
