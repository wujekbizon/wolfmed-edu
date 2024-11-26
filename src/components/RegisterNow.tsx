import Link from 'next/link'

export default function RegisterNow() {
  return (
    <div className="w-full flex items-center justify-center py-8 sm:py-12">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 ">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-zinc-400/20">
          {/* Header Section */}
          <div className="text-center px-6 py-8 sm:py-12 bg-gradient-to-br from-rose-50 to-rose-300 ">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-zinc-800 mb-4">
              Dołącz do społeczności opiekunów medycznych
            </h2>
            <p className="text-lg sm:text-xl text-zinc-600">
              Stawiamy na rozwój, nowoczesność i technologie. Z nami osiągniesz zamierzone cele.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 sm:p-8 bg-gradient-to-b from-white to-rose-50">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-rose-100 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-rose-50 rounded-xl flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-rose-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-zinc-800 mb-2">Nowoczesna Nauka</h3>
              <p className="text-zinc-600">
                Pełny dostęp do bazy pytań testowych oraz procedur opiekuna medycznego. Ucz się w swoim tempie.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-rose-100 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-rose-50 rounded-xl flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-rose-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-zinc-800 mb-2">Blog Medyczny</h3>
              <p className="text-zinc-600">
                Praktyczna wiedza od doświadczonych opiekunów. Regularne artykuły i porady zawodowe.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-rose-100 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 bg-rose-50 rounded-xl flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-rose-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-zinc-800 mb-2">Śledzenie Postępów</h3>
              <p className="text-zinc-600">
                Monitoruj swoje postępy dzięki szczegółowym analizom i statystykom wyników testów.
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="px-6 py-8 sm:py-10 bg-white text-center">
            <Link
              href="/sign-up"
              className="inline-block px-8 py-4 bg-gradient-to-r from-rose-400 to-rose-500 text-white font-medium text-lg rounded-full hover:from-rose-500 hover:to-rose-600 transition-all duration-300 transform hover:scale-105 focus:ring-4 focus:ring-rose-300/50 shadow-lg shadow-rose-200"
            >
              Dołącz do nas za darmo
            </Link>
            <p className="mt-4 text-sm text-zinc-500">Dołącz do ponad 820 aktywnych użytkowników już dziś!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
