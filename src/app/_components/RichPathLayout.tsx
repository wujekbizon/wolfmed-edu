import { PathData } from "@/types/careerPathsTypes";
import TriangleDivider from "@/components/TriangleDivider";
import GradientOverlay from "@/components/GradientOverlay";
import SimplePathCard from "@/components/SimplePathCard";
import Link from "next/link";
import CurriculumMap from "../../components/CurriculumMap";
import TestimonialsCarousel from "../../components/TestimonialsCarousel";

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

      {features && features.length > 0 && (
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
      )}
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
              {Object.entries(pricing).map(([plan, { price, features }]) => {
                const isPremium = plan.toLowerCase().includes("premium");
                return (
                  <article key={plan} className="h-full">
                    <div
                      className={`
                        h-full min-h-[480px] md:min-h-[560px] flex flex-col rounded-3xl p-6 sm:p-8 md:p-10
                        transition-all duration-300
                        ${
                          isPremium
                            ? "bg-white ring-2 ring-slate-900/10 shadow-xl hover:shadow-2xl hover:-translate-y-1"
                            : "bg-white ring-1 ring-zinc-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                        }
                      `}
                    >
                      {isPremium && (
                        <span className="self-end mb-2 text-[11px] md:text-xs font-semibold uppercase tracking-wide px-3 py-1.5 rounded-full bg-slate-900/5 text-slate-700">
                          Najlepszy wybór
                        </span>
                      )}

                      <h3 className="text-xl md:text-2xl font-extrabold mb-2 text-slate-900">{plan}</h3>
                      <p className="text-3xl md:text-4xl font-bold mb-4 md:mb-6 tracking-tight text-slate-700">{price}</p>

                      <ul className="grow space-y-3 md:space-y-4 text-left w-full max-w-sm text-zinc-700">
                        {features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm md:text-base leading-relaxed">
                            <svg
                              className="mt-0.5 w-5 h-5 md:w-6 md:h-6 flex-shrink-0 text-slate-500"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-auto w-full pt-6 md:pt-8">
                        <Link
                          href="/sign-up"
                          className={`
                            inline-flex w-full items-center justify-center rounded-xl px-5 py-3.5
                            font-semibold transition-colors duration-200
                            ${isPremium ? "bg-slate-900 text-white hover:bg-slate-800" : "bg-slate-700 text-white hover:bg-slate-800"}
                          `}
                        >
                          {isPremium ? "Wybierz Premium" : "Rozpocznij"}
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section
        aria-labelledby="testimonials-title"
        className="relative w-full  px-4 sm:px-8 md:px-16 py-12 sm:py-16 lg:py-20 bg-slate-950"
      >
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(244,63,94,0.35)_0%,transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(40%_40%_at_90%_90%,rgba(99,102,241,0.25)_0%,transparent_60%)]" />
        </div>

        <header className="relative mb-8 sm:mb-12 text-center">
          <span className="inline-block rounded-full bg-white/10 text-white px-3 py-1 text-xs font-medium tracking-wide">
            Opinie studentów
          </span>
          <h2 id="testimonials-title" className="mt-3 text-2xl md:text-3xl lg:text-4xl font-bold text-white">
            Co mówią o programie
          </h2>
          <p className="mt-2 text-sm md:text-base text-zinc-300">Prawdziwe głosy naszych użytkowników.</p>
        </header>

        <div className="relative mx-auto w-full max-w-4xl">
          <TestimonialsCarousel testimonials={testimonials ?? []} />
        </div>
      </section>
    </section>
  );
}