import Link from 'next/link'
import Card from '@/components/ui/Card'
import { requireCategoryAccess } from '@/server/learning/requireCategoryAccess'
import { isPracticeEnabled } from '@/server/learning/config'
import { getPlanProgress } from '@/server/planner/progress'
import type { LearningCategoryProps } from '@/types/learningPracticeTypes'

export default async function PracticePlan({ params }: LearningCategoryProps) {
  const { category } = await params
  if (!isPracticeEnabled(category)) return null
  try {
    const userId = await requireCategoryAccess(category)
    const progress = await getPlanProgress(userId)
    if (!progress) return null
    return <Card className="w-full max-w-3xl space-y-2 p-5">
      <h2 className="font-semibold">Twój plan nauki</h2>
      <p>Dzisiaj: {progress.todayMinutes} min{progress.todayIsStudyDay ? ` z ${progress.plan.minutesPerDay} min` : ' · dzień bez zaplanowanej nauki'}</p>
      {progress.suggestion && <p>Propozycja: {progress.suggestion.label}</p>}
      <p className="text-sm text-zinc-600">Pytania z ćwiczeń nie dopisują automatycznie minut do planu.</p>
      <Link href="/panel/plan" className="underline">Otwórz plan nauki</Link>
    </Card>
  } catch { return null }
}
