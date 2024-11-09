import { getUserMotto, getUserUsername, getSupporterByUserId, getUserStats } from '@/server/queries'
import { currentUser } from '@clerk/nextjs/server'
import { notFound } from 'next/navigation'
import DashboardInfo from '@/components/DashboardInfo'
import UsernameForm from '@/components/UsernameForm'
import MottoForm from '@/components/MottoForm'
import UserProgress from '@/components/UserProgress'
import ExamCountdown from '@/components/ExamCountdown'
import SupporterStatus from '@/components/SupporterStatus'
import UserMotto from '@/components/UserMotto'
import { Suspense } from 'react'
import UserProgressSkeleton from '@/components/skeletons/UserProgressSkeleton'
import UsernameSkeleton from '@/components/skeletons/UsernameSkeleton'
import UserMottoSkeleton from '@/components/skeletons/UserMottoSkeleton'

export const experimental_ppr = true

export default async function TestsPage() {
  const user = await currentUser()
  if (!user) notFound()

  const { totalScore, totalQuestions, testsAttempted } = await getUserStats(user.id)
  const username = await getUserUsername(user.id)
  const motto = await getUserMotto(user.id)
  const isSupporter = await getSupporterByUserId(user.id)

  return (
    <section className="flex justify-center h-full w-full">
      <div className="lg:w-[80%] xl:w-3/4 h-full w-full flex flex-col items-center p-2 gap-8 overflow-y-scroll scrollbar-webkit">
        <ExamCountdown />
        <DashboardInfo />
        <div
          className={`backdrop-blur-sm w-full gap-8 flex flex-col p-3 xs:-p-4 sm:p-10 rounded-2xl shadow-lg border border-zinc-200/60 transition-all duration-300 ${
            isSupporter ? 'bg-gradient-to-br from-zinc-50/80 via-rose-50/30 to-zinc-50/80' : 'bg-zinc-50/80'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Suspense fallback={<UsernameSkeleton />}>
              <h2 className="text-xl sm:text-2xl text-zinc-800 font-bold text-center sm:text-left">
                Panel użytkownika, <span className="text-[#f58a8a] font-semibold">{username}</span>
              </h2>
            </Suspense>
            <Suspense fallback={<div>Loading...</div>}>
              <SupporterStatus isSupporter={isSupporter} />
            </Suspense>
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col xs:flex-row gap-6">
              <Suspense fallback={<UserMottoSkeleton />}>
                <UserMotto motto={motto} />
              </Suspense>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white/60 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-md border border-zinc-200/60 hover:shadow-lg transition-all duration-300">
                <UsernameForm />
              </div>
              <div className="bg-white/60 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-md border border-zinc-200/60 hover:shadow-lg transition-all duration-300">
                <MottoForm />
              </div>
            </div>
          </div>
          <Suspense fallback={<UserProgressSkeleton />}>
            <UserProgress testsAttempted={testsAttempted} totalScore={totalScore} totalQuestions={totalQuestions} />
          </Suspense>
        </div>
      </div>
    </section>
  )
}
