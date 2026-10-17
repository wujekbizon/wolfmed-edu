import { ArrowLeft, CircleCheck, CircleX } from 'lucide-react'
import Link from 'next/link'
import { fetchQuestionDetails } from '@/actions/fetchQuestionDetails'
import type { CompletedTest } from '@/types/dataTypes'

export default async function TestResultCard({ completedTest }: { completedTest: CompletedTest }) {
  const { score, testResult } = completedTest
  const testsDataResponse = await fetchQuestionDetails(testResult)
  const testsData = testsDataResponse.filter((item): item is NonNullable<typeof item> => item !== undefined)
  const percent = testResult.length ? Math.round(score / testResult.length * 100) : 0

  return <section className="results-page">
    <div className="results-page-shell results-detail-shell">
      <Link className="results-back-link" href="/panel/wyniki">
        <ArrowLeft size={17} aria-hidden="true" /> Wróć do wyników
      </Link>
      <header className="results-page-header results-detail-header">
        <div className="results-page-header-copy">
          <p className="results-page-kicker">Analiza próby</p>
          <h1 className="results-page-title">Szczegóły testu</h1>
          <p className="results-page-description">Przejrzyj odpowiedzi i zobacz, które zagadnienia warto powtórzyć.</p>
        </div>
        <div className="results-detail-score">
          <span>Twój wynik</span>
          <strong>{score}<small> / {testResult.length}</small></strong>
          <span className="results-detail-percent">{percent}% poprawnych</span>
        </div>
      </header>

      <div className="result-detail-list">
        {testsData.map(({ testData, userCorrectAnswer }, index) => {
          const { id, data: { question, answers } } = testData
          const correctAnswer = answers?.find((answer) => answer.isCorrect)
          const isCorrect = userCorrectAnswer.isCorrect

          return <article key={id} className="result-question-card" data-correct={isCorrect}>
            <div className="result-question-heading">
              <span className="result-question-number">{String(index + 1).padStart(2, '0')}</span>
              <span className="result-question-status" data-correct={isCorrect}>
                {isCorrect ? <CircleCheck size={16} aria-hidden="true" /> : <CircleX size={16} aria-hidden="true" />}
                {isCorrect ? 'Poprawna odpowiedź' : 'Do powtórki'}
              </span>
            </div>
            <p className="result-question-text">{question}</p>
            <div className="result-correct-answer">
              <span>Poprawna odpowiedź</span>
              <p>{correctAnswer?.option ?? 'Nie znaleziono poprawnej odpowiedzi'}</p>
            </div>
          </article>
        })}
      </div>
      <Link className="results-back-link results-back-link-bottom" href="/panel/wyniki">
        <ArrowLeft size={17} aria-hidden="true" /> Wróć do historii testów
      </Link>
    </div>
  </section>
}
