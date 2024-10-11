import DashboardInfo from '@/components/DashboardInfo'
import UsernameForm from './UsernameForm'
import MottoForm from './MottoForm'
import CircularProgressBar from './CircularProgressBar'

export default function UserDashboard({
  username,
  completedTestsCount,
  averageScore,
  totalTests,
}: {
  username: string
  completedTestsCount: number
  averageScore: number
  totalTests: number
}) {
  return (
    <section className="flex justify-center h-full w-full">
      <div className="lg:w-[70%] xl:w-3/4 h-full w-full flex flex-col items-center p-2 gap-8 overflow-y-scroll scrollbar-webkit">
        <DashboardInfo />
        <div className="bg-white w-full gap-8 flex flex-col p-6 sm:p-10 rounded-2xl shadow-lg">
          <h2 className="text-2xl sm:text-3xl text-zinc-800 font-bold text-center sm:text-left">
            Panel użytkownika, <span className="text-[#f58a8a]">{username}</span>
          </h2>
          <div className="flex flex-col sm:flex-row gap-6 bg-zinc-50 p-6 rounded-xl shadow-inner">
            <UsernameForm />
            <MottoForm />
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md shadow-zinc-300 border border-red-200/40">
            <h3 className="text-xl font-semibold text-zinc-800 mb-6">Przegląd postępów</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="flex flex-col items-center">
                <CircularProgressBar
                  percentage={(completedTestsCount / totalTests) * 100}
                  color="#f58a8a"
                  size={160}
                  strokeWidth={12}
                />
                <p className="mt-4 text-lg font-semibold text-zinc-700">Ukończone testy</p>
                <p className="text-3xl font-bold text-[#f58a8a]">
                  {completedTestsCount} / {totalTests}
                </p>
              </div>
              <div className="flex flex-col items-center">
                <CircularProgressBar percentage={averageScore} color="#4CAF50" size={160} strokeWidth={12} />
                <p className="mt-4 text-lg font-semibold text-zinc-700">Średni wynik</p>
                <p className="text-3xl font-bold text-[#4CAF50]">{averageScore.toFixed(2)}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
