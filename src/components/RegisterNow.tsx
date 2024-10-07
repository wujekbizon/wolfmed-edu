import Link from 'next/link'

export default function RegisterNow() {
  return (
    <div id="register" className="text-white py-12 rounded-lg">
      <div className="max-w-6xl mx-auto text-center bg-gradient-to-br from-zinc-800 to-zinc-950 rounded-2xl border border-red-200/40 px-4 sm:px-8 py-12 shadow-md shadow-zinc-600/40">
        <h2 className="text-4xl font-bold mb-6">Dołącz do społeczności opiekunów medycznych.</h2>
        <p className="text-lg mb-8 text-zinc-400">
          My stawiamy na rozwój, nowoczesność i technologie. Z nami napewno osiągniesz zamierzone cele.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 min-h-[280px]">
          <div className="bg-zinc-700 border border-zinc-200/20 hover:bg-zinc-600/80 rounded-xl p-6 flex flex-col justify-center items-center">
            <h3 className="text-xl font-semibold mb-8">Nowoczesna Nauka</h3>
            <p className="text-base text-zinc-400">
              Szeroki dostęp do wszystkich pytań testowych oraz procedur opiekuna medycznego.
            </p>
          </div>
          <div className="bg-zinc-700 border border-zinc-200/20 hover:bg-zinc-600/80 rounded-xl p-6 flex flex-col justify-center items-center">
            <h3 className="text-xl font-semibold mb-8">Blog medyczny</h3>
            <p className="text-base text-zinc-400">
              Nasi doświadczeni opiekunowie dzielą się swoją wiedzą i praktycznymi wskazówkami.
            </p>
          </div>

          <div className="bg-zinc-700 border border-zinc-200/20 hover:bg-zinc-600/80 rounded-xl p-6 flex flex-col justify-center items-center">
            <h3 className="text-xl font-semibold mb-8">Śledzenie Postępów</h3>
            <p className="text-base text-zinc-400">
              Wizualizuj swoje postępy dzięki szczegółowym analizom i wglądom w wyniki testów.
            </p>
          </div>
        </div>
        <Link
          href="/sign-up"
          className="bg-white text-red-500 w-full font-bold py-3 px-3 sm:px-8 rounded-full text-base sm:text-xl hover:bg-opacity-80 transition-all duration-300"
        >
          Zarejestruj się
        </Link>
      </div>
    </div>
  )
}
