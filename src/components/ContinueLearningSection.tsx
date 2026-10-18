import Link from 'next/link'
import { checkPremiumAccessAction } from '@/actions/course-actions'
import { getAccessibleCategories } from '@/helpers/populateCategories'
import { getCurrentUser } from '@/server/user'
import { getUserCustomCategories } from '@/server/queries'
import { getActiveLearningResumes, getActivePracticeExamResumes } from '@/server/practiceResume'
import PracticeResumeCard from '@/components/PracticeResumeCard'

export default async function ContinueLearningSection() {
  const user = await getCurrentUser()
  if (!user) return null

  const [accessible, isPremium] = await Promise.all([
    getAccessibleCategories(),
    checkPremiumAccessAction(),
  ])
  const custom = isPremium ? await getUserCustomCategories(user.userId) : []
  const visibleCategories = [
    ...accessible.map((category) => ({ value: category.value, title: category.category })),
    ...custom.map((category) => ({ value: `moje-testy__${category.id}`, title: category.categoryName })),
  ]
  const categoryTitles = new Map(visibleCategories.map(({ value, title }) => [value, title]))
  const categoryValues = visibleCategories.map(({ value }) => value)
  const [exams, lessons] = await Promise.all([
    getActivePracticeExamResumes(user.userId, categoryValues, 3),
    getActiveLearningResumes(user.userId, accessible.map((category) => category.value)),
  ])

  const activities = [
    ...exams.map((attempt) => ({
      id: attempt.sessionId,
      kind: 'Trening egzaminacyjny',
      title: `${categoryTitles.get(attempt.category) ?? attempt.category} · ${attempt.numberOfQuestions} pytań`,
      detail: `${attempt.answeredQuestions}/${attempt.numberOfQuestions} odpowiedzi`,
      progress: attempt.answeredQuestions / attempt.numberOfQuestions * 100,
      updatedAt: attempt.lastActivityAt,
      href: `/panel/testy/${encodeURIComponent(attempt.category)}?sessionId=${attempt.sessionId}`,
    })),
    ...lessons.map((lesson) => ({
      id: lesson.sessionId,
      kind: 'Sesja nauki',
      title: categoryTitles.get(lesson.category) ?? lesson.category,
      detail: `${lesson.completedQuestions}/${lesson.totalQuestions} pytań przerobionych`,
      progress: lesson.completedQuestions / lesson.totalQuestions * 100,
      updatedAt: lesson.lastActivityAt,
      href: `/panel/nauka/${encodeURIComponent(lesson.category)}`,
    })),
  ].sort((left, right) => right.updatedAt.getTime() - left.updatedAt.getTime()).slice(0, 3)

  if (!activities.length) return null
  return (
    <section className="container mx-auto rounded-2xl border border-zinc-200/60 bg-white p-4 shadow-xl shadow-zinc-900/[0.07] sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-zinc-900">Kontynuuj naukę</h2>
          <p className="text-sm text-zinc-600">Wróć do treningu egzaminacyjnego lub sesji nauki.</p>
        </div>
        <div className="flex gap-4 text-sm font-semibold text-rose-600">
          <Link href="/panel/testy">Testy</Link>
          <Link href="/panel/nauka">Nauka</Link>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {activities.map((activity) => <PracticeResumeCard key={activity.id} {...activity} />)}
      </div>
    </section>
  )
}
