import DashboardInfo from '@/components/DashboardInfo'
import UsernameForm from './UsernameForm'
import MottoForm from './MottoForm'
import UserProgress from './UserProgress'

export default function UserDashboard({
  username,
  testsAttempted,
  averageScore,
  totalTests,
  motto,
  totalScore,
  totalQuestions,
}: {
  username: string
  testsAttempted: number
  averageScore: number
  totalTests: number
  motto: string
  totalScore: number
  totalQuestions: number
}) {
  return (
    <section className="flex justify-center h-full w-full">
      <div className="lg:w-[70%] xl:w-3/4 h-full w-full flex flex-col items-center p-2 gap-8 overflow-y-scroll scrollbar-webkit">
        <div className="w-full flex justify-center bg-white p-6 rounded-xl shadow-md shadow-zinc-500 border border-red-200/40">
          <p className="text-lg font-semibold text-zinc-800">
            Twoje motto na dziś: <span className="text-[#f58a8a] font-bold ml-2">{motto}</span>
          </p>
        </div>
        <DashboardInfo />
        <div className="bg-white w-full gap-8 flex flex-col p-6 sm:p-10 rounded-2xl shadow-lg">
          <h2 className="text-xl sm:text-2xl text-zinc-800 font-bold text-center sm:text-left">
            Panel użytkownika, <span className="text-[#f58a8a]">{username}</span>
          </h2>
          <div className="flex flex-col sm:flex-row gap-6 bg-zinc-50 p-6 rounded-xl shadow-md shadow-zinc-500 border border-red-200/40">
            <UsernameForm />
            <MottoForm />
          </div>

          <UserProgress
            testsAttempted={testsAttempted}
            averageScore={averageScore}
            totalTests={totalTests}
            totalScore={totalScore}
            totalQuestions={totalQuestions}
          />
        </div>
      </div>
    </section>
  )
}
