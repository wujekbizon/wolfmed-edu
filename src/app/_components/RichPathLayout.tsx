import { PathData } from "@/types/careerPathsTypes";
import TriangleDivider from "@/components/TriangleDivider";
import GradientOverlay from "@/components/GradientOverlay";
import SimplePathCard from "@/components/SimplePathCard";
import Link from "next/link";
import CurriculumMap from "../../components/CurriculumMap";
import CoursePricingCard from "@/components/CoursePricingCard";

export default function RichPathLayout({
  title,
  description,
  features,
  curriculum,
  pricing,
  testimonials,
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

      {/* {features && features.length > 0 && (
        <section aria-labelledby="features-title" className="w-full relative p-0 lg:p-4 xl:p-8 2xl:p-16">
          <header className="mb-8 sm:mb-12 lg:mb-16 text-center">
            <span className="inline-block rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-xs font-medium tracking-wide">
              Co oferujemy
            </span>
            <h2 id="features-title" className="mt-3 text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900">
              Cechy kierunku i narzędzia
            </h2>
            <p className="mt-3 text-zinc-600 text-base md:text-lg">
              Moduły i materiały, które pomogą Ci w nauce i przygotowaniu do egzaminu.
            </p>
          </header>

          <div className="grid gap-10 grid-cols-[repeat(auto-fit,_minmax(280px,_1fr))] justify-items-center">
            {features.map((feature, index) => (
              <SimplePathCard key={index} {...feature} />
            ))}
          </div>
        </section>
      )} */}
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
                  const isPremium = tierName.toLowerCase().includes('premium')
                  return (
                    <CoursePricingCard
                      key={tierName}
                      tierName={tierName}
                      price={tierData.price}
                      priceId={tierData.priceId}
                      courseSlug={pricing.courseSlug}
                      accessTier={tierData.accessTier}
                      features={tierData.features}
                      isPremium={isPremium}
                    />
                  )
                })}
            </div>
          </div>
        </section>
      )}

      {/* Coming Soon section - hidden while pricing is active */}
      {/* <section aria-labelledby="coming-soon-title" className="w-full min-h-[65vh] flex items-center relative">
        <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
          <div className="text-center bg-white rounded-3xl p-8 sm:p-12 lg:p-16 shadow-xl ring-1 ring-zinc-200">
            <span className="inline-block rounded-full bg-red-100 text-red-700 px-4 py-2 text-sm font-semibold tracking-wide mb-6">
              Już wkrótce!
            </span>

            <p className="text-lg md:text-xl text-zinc-600 mb-4 max-w-2xl mx-auto">
              Premiera programu Pielęgniarstwo planowana jest na <strong className="text-slate-900">1 kwartał 2026 roku</strong>.
            </p>

            <p className="text-base md:text-lg text-zinc-600 mb-8 max-w-2xl mx-auto">
              Chcesz być na bieżąco? Skontaktuj się z nami, a poinformujemy Cię o starcie kursu!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/#contact"
                className="inline-flex items-center justify-center rounded-xl px-8 py-4 bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                Skontaktuj się z nami
              </Link>

              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-xl px-8 py-4 bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-colors duration-200"
              >
                Wróć do strony głównej
              </Link>
            </div>
          </div>
        </div>
      </section> */}
    </section>
  );
}