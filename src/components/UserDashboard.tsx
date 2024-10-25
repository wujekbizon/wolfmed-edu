import DashboardInfo from '@/components/DashboardInfo'
import UsernameForm from './UsernameForm'
import MottoForm from './MottoForm'
import UserProgress from './UserProgress'
import Link from 'next/link'

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
        <div className="w-full flex justify-center bg-white p-6 rounded-xl shadow-md shadow-zinc-500 border border-red-200/40">
          <p className="text-lg font-semibold text-zinc-800 text-center">
            Twoje motto: <span className="text-[#f58a8a] font-bold ml-2">{motto}</span>
          </p>
        </div>
        <DashboardInfo />
        <div
          className={`bg-white w-full gap-8 flex flex-col p-6 sm:p-10 rounded-2xl shadow-lg ${
            isSupporter ? 'border-2 border-green-300/80' : ''
          }`}
        >
          <h2 className="text-xl sm:text-2xl text-zinc-800 font-bold text-center sm:text-left">
            Panel użytkownika, <span className="text-[#f58a8a]">{username}</span>
          </h2>
          {isSupporter ? (
            <div
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <strong className="font-bold">Dziękujemy za wsparcie!</strong>
              <span className="block sm:inline"> Twoje wsparcie pomaga nam rozwijać projekt.</span>
            </div>
          ) : (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Wesprzyj nas!</strong>
              <span className="block sm:inline"> Wspieraj rozwój projektu i pomóż nam w jego dalszym tworzeniu.</span>
              <Link href="/wsparcie-projektu" className="underline ml-2 hover:text-blue-900 transition-colors">
                Dowiedz się więcej
              </Link>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-6 bg-zinc-50 p-4 sm:p-6 rounded-xl shadow-md shadow-zinc-500 border border-red-200/40">
            <UsernameForm />
            <MottoForm />
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
