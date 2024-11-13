import { Suspense } from 'react'
import RegisterNow from '@/components/RegisterNow'
import ThankYou from '@/components/ThankYou'
import { SignedIn, SignedOut } from '@clerk/nextjs'

export default async function Membership() {
  return (
    <section className="bg-gradient-to-b from-zinc-50 to-purple-100 min-h-screen w-full py-8">
      <div className="container mx-auto px-4">
        <SignedIn>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Content Area */}
            <div className="lg:col-span-8">
              <ThankYou />
            </div>
            {/* Community Updates Sidebar */}
            <aside className="lg:col-span-4 space-y-6">
              {/* Latest Updates */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-zinc-400/20">
                <h3 className="text-xl font-bold text-zinc-800 mb-4">Najnowsze Aktualizacje</h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-zinc-300 pl-4">
                    <p className="text-sm text-zinc-500">13 Listopada 2024</p>
                    <h4 className="font-medium text-zinc-800">Rozwój Społeczności</h4>
                    <p className="text-sm text-zinc-600">Już ponad 650 aktywnych użytkowników!</p>
                  </div>
                  <div className="border-l-4 border-red-500 pl-4">
                    <p className="text-sm text-zinc-500">31 Października 2024</p>
                    <h4 className="font-medium text-zinc-800">Nowa baza pytań</h4>
                    <p className="text-sm text-zinc-600">Dodaliśmy 38 nowych pytań do naszej bazy</p>
                  </div>
                </div>
              </div>

              {/* Video Procedures Announcement */}
              <div className="bg-gradient-to-r from-[#ff5b5b] to-purple-500 border border-zinc-400/20 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-3">Nowość 2025!</h3>
                  <p className="text-base mb-2 font-medium">Procedury Medyczne na Video</p>
                  <p className="text-sm opacity-90 mb-4">
                    Przygotowujemy dla Was profesjonalne materiały video pokazujące krok po kroku najważniejsze
                    procedury wykonywane przez opiekunów medycznych.
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="bg-white/20 px-3 py-1 rounded-full text-xs xs:text-sm">Już wkrótce</span>
                    <span className="bg-white/20 px-3 py-1 rounded-full text-xs xs:text-sm">20+ procedur</span>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#ff5b5b]/10 via-purple-500/5 to-transparent opacity-50" />
              </div>

              {/* Upcoming Features */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-zinc-400/20">
                <h3 className="text-xl font-bold text-zinc-800 mb-4">Planowane Funkcje</h3>
                <ul className="space-y-3 text-zinc-600">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                    Forum dyskusyjne
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    Materiały edukacyjne
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    Wideo procedury
                  </li>
                </ul>
              </div>

              {/* Community Spotlight */}
              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-xl p-6 text-white border border-zinc-400/20">
                <h3 className="text-xl font-bold mb-3">Dołącz do Dyskusji</h3>
                <p className="text-sm opacity-90 mb-4">
                  Wkrótce uruchomimy forum, gdzie będziesz mógł dzielić się wiedzą i doświadczeniem z innymi
                  uczestnikami
                </p>
                <button
                  disabled
                  className="bg-white text-red-600 px-4 py-2 rounded-full text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Dowiedz się więcej
                </button>
              </div>
            </aside>
          </div>
        </SignedIn>
        <SignedOut>
          <RegisterNow />
        </SignedOut>
      </div>
    </section>
  )
}
