import { Suspense } from 'react'
import { getCurrentUser } from '@/server/user'
import { getUserEnrollmentsAction } from '@/actions/course-actions'
import UserOnboard from '@/components/UserOnboard'
import ExamCountdown from '@/components/ExamCountdown'
import ExamCountdownSkeleton from '@/components/skeletons/ExamCountdownSkeleton'
import StatsRow from '@/components/StatsRow'
import CourseAccessWidget from '@/components/CourseAccessWidget'
import ForumActivityCard from '@/components/ForumActivityCard'
import OnboardingChecklist from '@/components/OnboardingChecklist'

export default async function DynamicBoard() {
  const [user, { enrollments }] = await Promise.all([
    getCurrentUser(),
    getUserEnrollmentsAction(),
  ])

  return (
    <section className="container mx-auto backdrop-blur-xl p-3 xs:p-4 sm:p-8 rounded-2xl shadow-xl shadow-zinc-900/5 border border-zinc-200 transition-all duration-300 bg-white">
      <StatsRow
        totalQuestions={user?.totalQuestions ?? 0}
        testsAttempted={user?.testsAttempted ?? 0}
        totalScore={user?.totalScore ?? 0}
        enrolledCount={enrollments.length}
      />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <UserOnboard enrollments={enrollments} />
        </div>
        <aside className="lg:col-span-4 rounded-2xl">
          <div className="space-y-4 p-4 rounded-2xl bg-zinc-600/20 backdrop-blur-[2px] border border-zinc-400/70">
            <CourseAccessWidget enrollments={enrollments} />
            <Suspense fallback={null}>
              <ForumActivityCard />
            </Suspense>
            <OnboardingChecklist />
            <Suspense fallback={<ExamCountdownSkeleton />}>
              <ExamCountdown />
            </Suspense>
          </div>
        </aside>
      </div>
    </section>
  )
}
