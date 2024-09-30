import Link from 'next/link'

export default function About() {
  return (
    <section className="relative h-[calc(100vh_-_70px)] w-full flex flex-col items-center justify-end bg-[#ffb5b5] bg-[url('/students.jpg')] rounded-br-[46px] bg-top rounded-bl-[46px] bg-cover p-4 xs:p-12">
      <div className="container w-full md:w-3/4 xl:w-1/2 bg-[#ffb5b5]/90 p-4 sm:p-6 flex flex-col gap-3 rounded-2xl shadow-md shadow-zinc-500 border border-red-200/60">
        <h1 className="text-2xl sm:text-4xl font-bold py-2 text-center">
          WOLFMED <span className="text-zinc-500 font-semibold">EDUKACJA</span>
        </h1>
        <p className="text-base">
          To <span className="font-bold text-lg text-white">innowacyjny</span> startup edukacyjny dedykowany przyszłym{' '}
          <span className="font-bold text-lg text-[#ff5b5b]">opiekunom medycznym</span>, którzy przygotowują się do
          egzaminów zawodowych.
        </p>
        <p className="text-base">
          Oferujemy <span className="font-bold text-lg underline">bezpłatny</span> dostęp do najnowszych testów i pytań
          medycznych, które pomogą Ci rozwinąć swoją wiedzę i umiejętności.
        </p>
        <p>
          Jesteśmy w trakcie rozwoju dlatego zachęcamy każdego do wsparcia naszego startupu:
          <span className="text-xl font-bold text-red-500 animate-pulse">
            {' '}
            <Link target="_blank" href="https://buymeacoffee.com/grzegorzwolfinger">
              Kupuje serduszko ❤️
            </Link>
          </span>
        </p>
        <div className="flex flex-col w-full items-end gap-2">
          <p className="text-base">
            Dołącz do nas w budowaniu społeczności zmotywowanych osób zaangażowanych w pozytywny wpływ na opiekę
            zdrowotną.
          </p>
        </div>
      </div>
    </section>
  )
}
