import Link from 'next/link'
import { getCurrentUser } from '@/server/user'
import { getActivePlan, getUserEnrolledCourses } from '@/server/queries'
import ExamCountdown from './ExamCountdown'
import CountdownTimer from './CountdownTimer'

function formatDate(date: Date): string {
  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`
}

/**
 * Course-aware countdown for the panel dashboard:
 * - active learning plan → countdown to the user's own due date
 * - no plan, opiekun-medyczny student → state-exam countdown (legacy behavior)
 * - no plan, other courses → CTA to create a plan instead of dead exam info
 */
export default async function PlanCountdown() {
  const user = await getCurrentUser()
  if (!user) return null

  const [plan, enrolledCourses] = await Promise.all([
    getActivePlan(user.userId),
    getUserEnrolledCourses(user.userId),
  ])

  if (plan) {
    const now = Date.now()
    const difference = Math.max(0, plan.dueDate.getTime() - now)
    const timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    }

    return (
      <div className="w-full p-4 sm:p-6 bg-gradient-to-br from-zinc-900/95 to-black/90 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/40 border border-white/[0.08] hover:shadow-black/60 transition-all duration-300">
        <h3 className="text-lg sm:text-xl font-bold text-white text-center mb-2 sm:mb-4">
          {plan.name}
        </h3>
        <CountdownTimer
          initialDays={timeLeft.days}
          initialHours={timeLeft.hours}
          initialMinutes={timeLeft.minutes}
          initialSeconds={timeLeft.seconds}
        />
        <p className="text-zinc-400 text-xs sm:text-sm text-center mt-3 sm:mt-4">
          Twój termin:{' '}
          <span className="text-[#ff9898] ml-1 font-medium">
            {formatDate(plan.dueDate)}
          </span>
        </p>
        <Link
          href="/panel/plan"
          className="block text-center mt-3 text-xs sm:text-sm font-semibold text-white bg-red-500/80 hover:bg-red-500 rounded-lg py-2 transition-colors"
        >
          Zobacz dzisiejszy plan →
        </Link>
      </div>
    )
  }

  const hasOpiekunCourse = enrolledCourses.some(
    (course) => course.slug === 'opiekun-medyczny'
  )

  if (hasOpiekunCourse) {
    return (
      <div className="space-y-3">
        <ExamCountdown />
        <Link
          href="/panel/plan"
          className="block text-center text-xs sm:text-sm font-semibold text-zinc-600 border border-zinc-200 hover:border-zinc-400 rounded-xl py-2.5 transition-colors bg-white"
        >
          Utwórz plan nauki do egzaminu →
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full p-4 sm:p-6 bg-gradient-to-br from-zinc-900/95 to-black/90 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/40 border border-white/[0.08] hover:shadow-black/60 transition-all duration-300">
      <h3 className="text-lg sm:text-xl font-bold text-white text-center">
        Zaplanuj swoją naukę
      </h3>
      <p className="text-zinc-400 text-xs sm:text-sm text-center mt-2">
        Ustal cel, termin i tempo — a Wolfmed pomoże Ci utrzymać kurs.
      </p>
      <Link
        href="/panel/plan"
        className="block text-center mt-4 text-xs sm:text-sm font-semibold text-white bg-red-500/80 hover:bg-red-500 rounded-lg py-2 transition-colors"
      >
        Stwórz plan nauki →
      </Link>
    </div>
  )
}
