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
    <div className="bg-linear-to-br from-white/25 via-white/35 to-white/25 backdrop-blur-xl border border-white/50 rounded-2xl p-2 sm:p-6 shadow-lg hover:shadow-xl hover:border-white/70 transition-all duration-300">
      <div className="flex gap-2 mb-6 border-b border-white/40 pb-4">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
            activeTab === 'overview'
              ? 'bg-white/80 text-slate-900 shadow-md'
              : 'bg-white/40 text-zinc-700 hover:bg-white/60'
          }`}
        >
          Przegląd
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
            activeTab === 'analytics'
              ? 'bg-white/80 text-slate-900 shadow-md'
              : 'bg-white/40 text-zinc-700 hover:bg-white/60'
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
