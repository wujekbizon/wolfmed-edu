import RegisterNow from '@/components/RegisterNow'
import ThankYou from '@/components/ThankYou'
import { SignedIn, SignedOut } from '@clerk/nextjs'
import Link from 'next/link'

export default function Membership() {
  return (
    <section className="bg-linear-to-b from-zinc-50 to-purple-100 min-h-screen w-full py-8 flex items-center justify-center">
      <div className="container mx-auto px-4">
        <SignedIn>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Content Area */}
            <div className="lg:col-span-8">
              <ThankYou />
            </div>
            {/* Community Updates Sidebar */}
            <aside className="lg:col-span-4 space-y-6 ">
              {/* Latest Updates */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-zinc-400/20">
                <h3 className="text-xl font-bold text-zinc-800 mb-4">Najnowsze Aktualizacje</h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-red-500 pl-4">
                    <p className="text-sm text-zinc-500">12 Kwiecień 2025</p>
                    <h4 className="font-medium text-zinc-800">Aktualizacja bazy testów</h4>
                    <p className="text-sm text-red-400 hover:text-red-500 transition-colors">
                      Poszerzyliśmy nasza bazę danych o najnowsze 40 testów z egzaminów ze Stycznia 2025
                    </p>
                  </div>
                  <div className="border-l-4 border-zinc-300 pl-4">
                    <p className="text-sm text-zinc-500">12 Kwiecień 2025</p>
                    <h4 className="font-medium text-zinc-800">Rozwój Społeczności</h4>
                    <p className="text-sm text-zinc-600">Już ponad 2500 aktywnych użytkowników!</p>
                  </div>
                </div>
              </div>
              {/* Community Spotlight */}
              <div className="bg-linear-to-br from-red-500 to-red-600 rounded-2xl shadow-xl p-6 text-white border border-zinc-400/20">
                <h3 className="text-xl font-bold mb-3">🎉 Zapraszamy na forum 🎉</h3>
                <p className="text-sm opacity-90 mb-4">
                  Właśnie uruchomiliśmy forum, gdzie możesz dzielić się swoją wiedzą i doświadczeniem z innymi
                  uczestnikami
                </p>
                <Link
                  href="/forum"
                  className="bg-white text-red-600 px-4 py-2 rounded-full text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Forum dyskusyjne
                </Link>
              </div>
              {/* Video Procedures Announcement */}
              <div className="bg-linear-to-r from-[#ff5b5b] to-purple-500 border border-zinc-400/20 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden">
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
                <div className="absolute inset-0 bg-linear-to-r from-[#ff5b5b]/10 via-purple-500/5 to-transparent opacity-50" />
              </div>

              {/* Upcoming Features */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-zinc-400/20">
                <h3 className="text-xl font-bold text-zinc-800 mb-4">Planowane Funkcje</h3>
                <ul className="space-y-3 text-zinc-600">
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
            </aside>
          </div>
        </SignedIn>

      </div>
    </section>
  )
}
