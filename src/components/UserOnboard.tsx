import Link from "next/link"
import { careerPathsData } from "@/constants/careerPathsData"

export default function UserOnboard() {
  return (
    <div className="w-full h-full flex justify-between">
      <div className="h-full p-3 sm:p-8 bg-white rounded-2xl shadow-xl border border-zinc-200/50">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-900 mb-4 leading-tight">
            Witamy w naszej społeczności!
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 font-light max-w-2xl mx-auto">
            Twoja podróż do profesjonalnej edukacji medycznej zaczyna się tutaj.
            Z darmowym dostępem do ścieżki
            <span className="font-semibold text-slate-600">
              {" "}
              Opiekuna Medycznego
            </span>
            , przygotuj się do egzaminów, poszerz wiedzę i rozwijaj swoje
            umiejętności z naszą aplikacją.
          </p>
        </div>
        <div className="mb-10">
          <h3 className="text-lg sm:text-xl font-semibold text-zinc-800 text-center mb-6">
            Dostępne ścieżki rozwoju
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(careerPathsData).map(([slug, path]) => (
              <Link
                href={`/kierunki/${slug}`}
                key={slug}
                className="block relative min-h-[250px]"
              >
                <div
                  className={`p-6 rounded-2xl shadow-md transition-all duration-300 h-full flex flex-col justify-between relative ${slug === "opiekun-medyczny"
                    ? "bg-white border border-zinc-900/15 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg"
                    : "bg-white border border-gray-200"
                    }`}
                >
                  {slug === "opiekun-medyczny" && (
                    <span className="absolute top-1 right-1 bg-slate-950 text-white text-xs font-bold px-3 py-1 rounded-full animate-bounce-custom">
                      Darmowy Plan!
                    </span>
                  )}
                  <div className="relative z-10">
                    <h4 className={`text-lg font-semibold ${slug === "opiekun-medyczny"} mb-2`}>
                      {path.title}
                    </h4>
                    <p className="text-sm text-zinc-600 mb-4">
                      {path.description}
                    </p>
                  </div>
                  <span className="text-zinc-400 font-medium text-sm group-hover:underline mt-4 block relative z-10">
                    Zobacz więcej &rarr;
                  </span>

                  {slug !== "opiekun-medyczny" && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl bg-slate-900/70 pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-white mb-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 15v2m0-6v.01M7 10V7a5 5 0 0110 0v3m-5 5h.01"
                        />
                      </svg>
                      <span className="text-white text-sm font-bold text-center px-3 py-1 bg-gray-800/70 rounded-lg">
                        Dostępne w Płatnym Planie
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center border-t border-zinc-200 pt-8">
          <p className="text-base text-zinc-700 mb-4 max-w-2xl mx-auto">
            Pamiętaj, że możesz zaktualizować swoją nazwę użytkownika i motto
            nauki w dowolnym momencie w
            <Link
              href="/panel"
              className="text-slate-800 hover:underline font-medium ml-1"
            >
              Panelu Użytkownika
            </Link>
            . Tutaj również znajdziesz najnowsze aktualizacje, wiadomości i
            odliczanie do najbliższej sesji egzaminacyjnej!
          </p>
          <p className="text-base text-red-600 font-semibold mb-6">
            Zespół Wolfmed-Edukacja
          </p>
          <small className="block text-xs text-zinc-500 max-w-2xl mx-auto px-4 leading-relaxed">
            <h3 className="font-bold text-zinc-700 mb-2">
              Ważne informacje organizacyjne
            </h3>
            <p className="mb-2">
            Ze względu na rosnącą popularność platformy oraz koszty infrastruktury, wprowadzamy limit 25 testów miesięcznie dla użytkowników korzystających z darmowego planu.
            Wszyscy użytkownicy premium mają nielimitowany dostęp do wszystkich funkcji platformy.
            </p>
            <p className="mb-2">
            Aktywnie rozwijamy projekt i poszukujemy partnerów do długoterminowej współpracy. Naszym celem jest w przyszłości zwiększenie limitów dla użytkowników darmowych.
            </p>
            <p className="mb-4">
            Jeśli chcesz uzyskać nielimitowany dostęp oraz wesprzeć rozwój projektu, sprawdź naszą ofertę premium.
            </p>
            <Link
              href="/wsparcie-projektu"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 focus:ring-red-700 text-white font-medium text-sm rounded-full transition-all duration-300 transform hover:scale-105 inline-block"
            >
              Wesprzyj nasz projekt
            </Link>
          </small>
        </div>
      </div>
    </div>
  )
}
