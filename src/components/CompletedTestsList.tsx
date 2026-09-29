'use client'

import { ChartNoAxesCombined } from 'lucide-react'
import type { CompletedTest } from '@/types/dataTypes'
import CompletedTestCard from './CompletedTestCard'
import SortSelect from './SortSelect'
import { useSortedTests } from '@/hooks/useSortedTests'

interface CompletedTestsListProps {
  tests: CompletedTest[]
}

export default function CompletedTestsList({ tests }: CompletedTestsListProps) {
  const sortedTests = useSortedTests(tests)

  return <section className="results-page">
    <div className="results-page-shell">
      <header className="results-page-header">
        <div className="results-page-header-copy">
          <p className="results-page-kicker">Twoje postępy</p>
          <h1 className="results-page-title">Wyniki testów</h1>
          <p className="results-page-description">Sprawdź swoje próby, wróć do odpowiedzi i zdecyduj, co powtórzyć.</p>
        </div>
        <div className="results-count-pill">
          <ChartNoAxesCombined size={17} aria-hidden="true" />
          <span><strong>{sortedTests.length}</strong> ukończonych testów</span>
        </div>
      </header>

      <div className="results-toolbar">
        <div>
          <h2>Historia testów</h2>
          <p>Wybierz próbę, aby zobaczyć odpowiedzi.</p>
        </div>
        <SortSelect />
      </div>

      {sortedTests.length === 0 ? <div id="panel-results-history" className="results-empty-state">
        <span className="results-empty-icon"><ChartNoAxesCombined size={22} aria-hidden="true" /></span>
        <h2>Nie masz jeszcze wyników</h2>
        <p>Ukończ test, a jego wynik i odpowiedzi pojawią się tutaj.</p>
      </div> : <div className="results-list">
        {sortedTests.map((completedTest, index) => (
          <CompletedTestCard key={completedTest.id} completedTest={completedTest} isWolfekTarget={index === 0} />
        ))}
      </div>}
    </div>
  </section>
}
