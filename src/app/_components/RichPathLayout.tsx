import { PathData } from "@/types/careerPathsTypes";
import TriangleDivider from "@/components/TriangleDivider";
import GradientOverlay from "@/components/GradientOverlay";
import CurriculumMap from "../../components/CurriculumMap";
import CoursePricingCard from "@/components/CoursePricingCard";

export default function RichPathLayout({
  title,
  description,
  curriculum,
  pricing,
}: PathData) {
  return (
    <section className="relative @container flex flex-col w-full gap-12 overflow-hidden">
      <TriangleDivider
        direction="right"
        className="border-b-[5vh] lg:border-b-[10vh] border-r-transparent border-b-transparent"
      />

      <GradientOverlay />

      <div className="relative w-full">
        <div className="flex flex-col items-center text-center">
          <span className="mb-3 sm:mb-4 inline-block rounded-full bg-white px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-zinc-600">
            Kierunek Edukacyjny
          </span>
          <h1 className="mb-2 lg:mb-4 max-w-2xl text-3xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-700 p-2 leading-14">
            {title}
          </h1>
          <p className="mb-8 sm:mb-16 max-w-3xl text-zinc-500 text-base sm:text-xl font-normal leading-6 tracking-[-0.14px] text-center">
            {description}
          </p>
        </div>
      </div>
      <section aria-labelledby="curriculum-title" className="relative w-full p-4 sm:p-8 bg-white">
        <header className="mb-6 sm:mb-10 text-center">
          <span className="inline-block rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-xs font-medium tracking-wide">
            Program nauczania
          </span>
          <h2 id="curriculum-title" className="mt-3 text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900">
            Szczegółowa mapa programu
          </h2>
          <p className="mt-3 text-zinc-600 text-base md:text-lg">
            Przeglądaj przedmioty według roku. Rozwiń moduły, aby zobaczyć liczbę godzin, ECTS i formę zaliczenia.
          </p>
        </header>
        <div className="mx-auto w-full max-w-none lg:max-w-6xl">
          <CurriculumMap curriculum={curriculum ?? []} />
        </div>
      </section>
      {pricing && (
        <section aria-labelledby="pricing-title" className="w-full min-h-[65vh] flex items-center relative">
          <div className="mx-auto w-full max-w-none lg:max-w-6xl px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
            <header className="mb-8 sm:mb-12 lg:mb-16 text-center">
              <span className="inline-block rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-xs font-medium tracking-wide">
                Cennik
              </span>
              <h2 id="pricing-title" className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900">
                Plany cenowe
              </h2>
              <p className="mt-3 text-zinc-600 text-base md:text-lg">Wybierz plan dopasowany do Twoich potrzeb.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-stretch">
              {Object.entries(pricing)
                .filter(([key]) => key !== 'courseSlug')
                .map(([tierName, tierData]) => {
                  const tier = tierData as { price: string; priceId: string; accessTier: string; features: string[] }
                  const isPremium = tierName.toLowerCase().includes('premium')
                  return (
                    <CoursePricingCard
                      key={tierName}
                      tierName={tierName}
                      price={tier.price}
                      priceId={tier.priceId}
                      courseSlug={pricing.courseSlug}
                      accessTier={tier.accessTier}
                      features={tier.features}
                      isPremium={isPremium}
                    />
                  )
                })}
            </div>
          </div>
        </section>
      )}
    </section>
  );
}