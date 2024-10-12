import Link from 'next/link'

export default function ThankYou() {
  return (
    <div className="w-full flex items-center justify-center p-2 sm:p-4 md:p-8">
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 bg-white rounded-3xl shadow-xl">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-800 mb-4 sm:mb-6 text-center">
          Witamy w naszej społeczności!
        </h2>
        <div className="space-y-4 sm:space-y-6 text-zinc-700">
          <p className="text-base sm:text-lg">
            Dziękujemy za dołączenie do naszej nowej społeczności edukacyjnej i korzystanie z aplikacji przygotowującej
            do egzaminów na opiekuna medycznego.
          </p>
          <p className="text-base sm:text-lg font-semibold">
            Naszym głównym celem jest stworzenie profesjonalnego miejsca, w którym każdy z Was może się edukować i
            rozwijać.
          </p>
          <p className="text-base sm:text-lg">
            Obecnie nasza aplikacja jest darmowa, ale w przyszłości może wymagać wsparcia finansowego, aby utrzymać jej
            rozwój i jakość.
          </p>
          <div className="bg-zinc-100 p-4 sm:p-6 rounded-xl">
            <h3 className="text-xl sm:text-2xl font-bold text-zinc-800 mb-3 sm:mb-4">Jak możesz nas wesprzeć?</h3>
            <p className="text-base sm:text-lg mb-4">
              Jeśli chcesz pomóc nam w rozwoju naszego startupu i zapewnić dalsze bezpłatne korzystanie z aplikacji,
              rozważ wsparcie naszego projektu.
            </p>
            <div className="flex justify-center">
              <Link
                href="/konto-premium"
                className="mt-2 sm:mt-4 px-4 sm:px-6 py-2 sm:py-3 bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white font-bold text-sm sm:text-base rounded-full transition-all duration-300 transform hover:scale-105"
              >
                Wesprzyj nasz projekt
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-8 sm:mt-12 text-center">
          <h3 className="text-xl sm:text-2xl font-bold text-zinc-800 mb-2">Dziękujemy za Wasze wsparcie!</h3>
          <p className="text-base sm:text-lg text-red-600 font-semibold">Zespół Wolfmed-Edukacja</p>
        </div>
      </div>
    </div>
  )
}
