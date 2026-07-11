'use client'

import ProgressLineChart from './ProgressLineChart'
import QuestionAccuracyList from './QuestionAccuracyList'
import CategoryPerformanceTable from './CategoryPerformanceTable'

interface AnalyticsDetailedProps {
  timeline: Array<{
    date: string
    avgScore: string
    testsCount: number
    studyMinutes: number
  }>
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
  planId: string | null
}

export default function AnalyticsDetailed({ timeline, categories, problemQuestions, planId }: AnalyticsDetailedProps) {
  return (
    <div className="space-y-8">
      <ProgressLineChart data={timeline} />
      <CategoryPerformanceTable categories={categories} planId={planId} />
      <QuestionAccuracyList questions={problemQuestions} />
    </div>
  )
}
