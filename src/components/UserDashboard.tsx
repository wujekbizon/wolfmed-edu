import DashboardInfo from '@/components/DashboardInfo'
import UsernameForm from './UsernameForm'
import MottoForm from './MottoForm'

export default function UserDashboard({
  username,
  completedTestsCount,
  averageScore,
}: {
  username: string
  completedTestsCount: number
  averageScore: number
}) {
  return (
    <section className="flex justify-center h-full w-full">
      <div className="lg:w-[70%] xl:w-3/4 h-full w-full flex flex-col items-center py-4 xs:py-8 gap-8 pr-2 overflow-y-scroll scrollbar-webkit">
        <DashboardInfo />
        <div className="border-red-200/60 shadow-md shadow-zinc-500 bg-white w-full gap-6 flex flex-col p-4 sm:p-8 rounded-xl">
          <h2 className="text-lg text-zinc-800">
            Profil użytkownika: <span className="font-bold text-lg text-[#f58a8a]">{username}</span>
          </h2>
          <div className="bg-zinc-400 p-4 rounded-lg shadow">
            <div className="flex flex-col sm:flex-row gap-4">
              <UsernameForm />
              <MottoForm />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border border-red-200/40">
            <h3 className="text-lg font-semibold text-zinc-800 mb-2">Przegląd postępów</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#ffc5c5] p-3 rounded-md">
                <p className="text-sm text-zinc-700">Ukończone testy</p>
                <p className="text-2xl font-bold text-zinc-700">{completedTestsCount}</p>
              </div>
              <div className="bg-[#ffc5c5] p-3 rounded-md">
                <p className="text-sm text-zinc-700">Średni wynik</p>
                <p className="text-2xl font-bold text-zinc-700">{averageScore.toFixed(2)}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
