import Link from 'next/link'

export default function ThankYou() {
  return (
    <div className="w-full flex items-center justify-center">
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 bg-white rounded-3xl shadow-xl border border-zinc-400/20">
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-zinc-800 mb-4">
            Witamy w naszej społeczności!
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-zinc-700 font-medium">
            Dziękujemy za dołączenie do naszej nowej społeczności edukacyjnej i korzystanie z aplikacji przygotowującej
            do egzaminów na opiekuna medycznego.
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6 text-zinc-700">
          <p className="text-base sm:text-lg text-center">
            Naszym głównym celem jest stworzenie profesjonalnego miejsca, w którym każdy z Was może się edukować i
            rozwijać.
          </p>

          <div className="bg-zinc-50 p-4 sm:p-6 rounded-xl text-sm sm:text-base">
            <h3 className="text-lg sm:text-xl font-bold text-zinc-800 mb-3 sm:mb-4">Ważne informacje organizacyjne</h3>
            <p className="mb-3 text-zinc-600">
              Ze względu na ograniczenia techniczne i koszty utrzymania infrastruktury, tymczasowo wprowadzamy limit 150
              rozwiązanych testów dla każdego użytkownika. Jednak dla wszystkich osób wspierających nasz projekt, jako
              wyraz wdzięczności, zdejmujemy to ograniczenie.
            </p>
            <p className="mb-3 text-zinc-600">
              Aktywnie poszukujemy sponsorów i osób chętnych do długoterminowego wsparcia projektu. Gdy tylko uda nam
              się pozyskać odpowiednie wsparcie, planujemy całkowicie znieść limity dla wszystkich użytkowników.
            </p>
            <p className="mb-4 text-zinc-600">
              Jeśli chcesz uzyskać nielimitowany dostęp do testów oraz pomóc nam w rozwoju projektu, rozważ wsparcie
              naszego startupu.
            </p>
            <div className="flex justify-center">
              <Link
                href="/wsparcie-projektu"
                className="px-4 sm:px-6 py-2 sm:py-3 bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white font-medium text-sm rounded-full transition-all duration-300 transform hover:scale-105"
              >
                Wesprzyj nasz projekt
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 sm:mt-10 text-center">
          <p className="text-base text-red-600 font-medium">Zespół Wolfmed-Edukacja</p>
        </div>
      </div>
    </div>
  )
}
