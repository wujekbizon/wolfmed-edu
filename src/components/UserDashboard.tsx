import DashboardInfo from '@/components/DashboardInfo'
import UsernameForm from './UsernameForm'
import MottoForm from './MottoForm'
import UserProgress from './UserProgress'
import ExamCountdown from './ExamCountdown'
import SupporterStatus from './SupporterStatus'
import UserMotto from './UserMotto'

export default function UserDashboard({
  username,
  testsAttempted,
  averageScore,
  motto,
  totalScore,
  totalQuestions,
  isSupporter,
}: {
  username: string
  testsAttempted: number
  averageScore: number
  motto: string
  totalScore: number
  totalQuestions: number
  isSupporter: boolean
}) {
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
            <h2 className="text-xl sm:text-2xl text-zinc-800 font-bold text-center sm:text-left">
              Panel użytkownika, <span className="text-[#f58a8a] font-semibold">{username}</span>
            </h2>
            <SupporterStatus isSupporter={isSupporter} />
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col xs:flex-row gap-6">
              <UserMotto motto={motto} />
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
          <UserProgress
            testsAttempted={testsAttempted}
            averageScore={averageScore}
            totalScore={totalScore}
            totalQuestions={totalQuestions}
          />
        </div>
      </div>
    </section>
  )
}
