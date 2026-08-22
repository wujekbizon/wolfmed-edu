'use client'

import { useState } from 'react'
import { LayoutGrid, LineChart, CalendarCheck } from 'lucide-react'
import type { PlanProgress } from '@/types/plannerTypes'
import type { TimelinePoint } from '@/types/analyticsTypes'
import AnalyticsOverview from './AnalyticsOverview'
import AnalyticsDetailed from './AnalyticsDetailed'
import AnalyticsPlanTab from './AnalyticsPlanTab'

interface UserAnalyticsClientProps {
  stats: {
    totalScore: number
    totalQuestions: number
    testsAttempted: number
  }
  timeline: TimelinePoint[]
  categories: Array<{
    category: string
    totalTests: number
    avgScore: string
    totalQuestions: number
    correctAnswers: number
    inPlan: boolean
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
  plan: PlanProgress | null
  planId: string | null
}

type Tab = 'overview' | 'analytics' | 'plan'

export default function UserAnalyticsClient({
  stats,
  timeline,
  categories,
  problemQuestions,
  plan,
  planId,
}: UserAnalyticsClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  const tabs: Array<{ id: Tab; label: string; icon: typeof LayoutGrid }> = [
    { id: 'overview', label: 'Przegląd', icon: LayoutGrid },
    { id: 'analytics', label: 'Szczegóły', icon: LineChart },
  ]
  if (plan) tabs.push({ id: 'plan', label: 'Plan', icon: CalendarCheck })

  return (
    <div className="bg-white border border-zinc-100 rounded-2xl p-2 sm:p-6 shadow-sm">
      <div className="flex gap-2 mb-6 border-b border-zinc-100 pb-4">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`inline-flex flex-1 xs:flex-none items-center justify-center gap-1.5 whitespace-nowrap px-2 xs:px-4 sm:px-6 py-2.5 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-200 ${
              activeTab === id
                ? 'bg-zinc-900 text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && <AnalyticsOverview stats={stats} />}
      {activeTab === 'analytics' && (
        <AnalyticsDetailed
          timeline={timeline}
          categories={categories}
          problemQuestions={problemQuestions}
          planId={planId}
        />
      )}
      {activeTab === 'plan' && plan && <AnalyticsPlanTab plan={plan} />}
    </div>
  )
}
