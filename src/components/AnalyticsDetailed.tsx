'use client'

import ProgressLineChart from './ProgressLineChart'
import QuestionAccuracyList from './QuestionAccuracyList'
import CategoryPerformanceTable from './CategoryPerformanceTable'

interface AnalyticsDetailedProps {
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

export default function AnalyticsDetailed({ timeline, categories, problemQuestions }: AnalyticsDetailedProps) {
  return (
    <div className="space-y-8">
      <ProgressLineChart data={timeline} />
      <CategoryPerformanceTable categories={categories} />
      <QuestionAccuracyList questions={problemQuestions} />
    </div>
  )
}
