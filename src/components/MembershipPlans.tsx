import Link from 'next/link'
import PremiumMemberCard from './PremiumMemberCard'

export default function MembershipPlans() {
  return (
    <>
      <div className=" w-full flex items-center justify-center p-4 sm:p-8">
        <div className="container max-w-6xl mx-auto px-8 py-12 bg-zinc-900/20 rounded-2xl">
          <h2 className="text-3xl font-bold text-zinc-800 mb-4">Witamy w naszej społeczności edukacyjnej!</h2>
          <p className="text-lg text-zinc-700 mb-8">
            Dziękujemy za dołączenie do naszej nowej społeczności edukacyjnej i korzystanie z naszej aplikacji
            przygotowującej do egzaminów na opiekuna medycznego. Naszym głównym celem jest stworzenie profesjonalnego
            miejsca, w którym każdy z Was może się edukować i rozwijać.
          </p>
          <p className="text-lg text-zinc-700 mb-8">
            <span className="font-semibold">
              Od początku chcieliśmy być bardzo transparentni z naszymi użytkownikami.
            </span>{' '}
            Początkowo zakładaliśmy, że aplikacja będzie oparta na płatnym modelu. Doszliśmy jednak do wniosku, że taki
            model nie jest odpowiedni na tym etapie. Obecnie nasza aplikacja korzysta z darmowych usług innych firm,
            które pozwalają na funkcjonowanie i korzystanie ze wszystkich dostępnych funkcji. Jednakże, w miarę jak w
            naszej aplikacji będzie przybywać użytkowników i będą rozwijane nowe funkcjonalności, będziemy musieli
            przejść na model płatny. Możemy tego uniknąć poprzez model crowdfundingu.
          </p>
          <p className="text-lg text-zinc-800 mb-8">
            Jeśli chcesz pomóc nam w rozwoju naszego startup, możesz to zrobić poprzez{' '}
            <Link className="text-red-500 font-bold text-xl hover:text-red-600" href="/#support">
              wsparcie naszego projektu
            </Link>
            . Dzięki Waszemu wsparciu będziemy mogli dalej rozwijać naszą społeczność i oferować Wam jeszcze więcej
            wartościowych treści.
          </p>
          <h3 className="text-2xl font-bold text-zinc-800  mb-4">Dziękujemy za Wasze wsparcie!</h3>
          <p className="text-base sm:text-lg text-red-300 font-semibold">Zespół Wolfmed-Edukacja</p>
        </div>
      </div>
      <div
        id="support"
        className="min-h-3/4 w-full flex-col md:flex-row flex-wrap flex justify-center items-center gap-4 md:gap-8 xl:gap-12 p-2 sm:p-8"
      >
        <PremiumMemberCard />
      </div>
    </>
  )
}
