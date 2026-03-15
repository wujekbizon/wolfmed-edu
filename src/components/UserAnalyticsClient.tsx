'use client'

import { useState } from 'react'
import AnalyticsOverview from './AnalyticsOverview'
import AnalyticsDetailed from './AnalyticsDetailed'

interface UserAnalyticsClientProps {
  stats: {
    totalScore: number
    totalQuestions: number
    testsAttempted: number
  }
  timeline: Array<{
    date: string
    avgScore: string
    testsCount: number
  }>
  categories: Array<{
    category: string
    totalTests: number
    avgScore: string
    totalQuestions: number
    correctAnswers: number
  }>
  problemQuestions: Array<{
    questionId: string
    questionText: string
    category: string
    correctAnswer: string
    timesAnswered: number
    timesCorrect: number
    accuracy: number
    errorRate: number
  }>
}

export default function UserAnalyticsClient({
  stats,
  timeline,
  categories,
  problemQuestions,
}: UserAnalyticsClientProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>('overview')

  return (
    <div className="bg-white border border-zinc-100 rounded-2xl p-2 sm:p-6 shadow-sm">
      <div className="flex gap-2 mb-6 border-b border-zinc-100 pb-4">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
            activeTab === 'overview'
              ? 'bg-zinc-900 text-white shadow-sm'
              : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50'
          }`}
        >
          Przegląd
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
            activeTab === 'analytics'
              ? 'bg-zinc-900 text-white shadow-sm'
              : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50'
          }`}
        >
          Szczegóły
        </button>
      </div>

      {activeTab === 'overview' && <AnalyticsOverview stats={stats} />}
      {activeTab === 'analytics' && (
        <AnalyticsDetailed
          timeline={timeline}
          categories={categories}
          problemQuestions={problemQuestions}
        />
      )}
    </div>
  )
}
