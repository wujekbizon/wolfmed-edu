import DashboardInfo from '@/components/DashboardInfo'
import Label from '@/components/Label'
import Input from './Input'
import UsernameForm from './UsernameForm'

export default function UserDashboard({ username }: { username: string }) {
  return (
    <section className="flex justify-center h-full w-full">
      <div className="lg:w-[70%] xl:w-3/4 h-full w-full flex flex-col items-center py-4 xs:py-8 gap-12 pr-2 overflow-y-scroll scrollbar-webkit">
        <DashboardInfo />

        <div className="border-red-200/60 shadow-md shadow-zinc-500 bg-white w-full gap-6 flex flex-col p-4 sm:p-8 rounded-xl">
          <h2 className="text-2xl font-bold text-zinc-900">Dodatkowe informacje</h2>

          {/* User Profile Section */}
          <div className="bg-[#ffb1b1] p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">Profil {username}</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <UsernameForm />
              <div className="flex-1">
                <Label label="Motto nauki" htmlFor="motto" className="text-zinc-600 text-sm" />
                <Input
                  type="text"
                  id="motto"
                  name="motto"
                  className="w-full px-4 py-2 rounded-md border outline-none border-zinc-300 focus:ring focus:ring-red-200 transition"
                  placeholder="Twoje motto"
                />
              </div>
            </div>
          </div>

          {/* Progress Overview Section */}
          <div className="bg-white p-4 rounded-lg shadow border border-red-200/40">
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">Przegląd postępów</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#ffc5c5] p-3 rounded-md">
                <p className="text-sm text-zinc-700">Ukończone testy</p>
                <p className="text-2xl font-bold text-zinc-900">0</p>
              </div>
              <div className="bg-[#ffc5c5] p-3 rounded-md">
                <p className="text-sm text-zinc-700">Średni wynik</p>
                <p className="text-2xl font-bold text-zinc-900">0%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
