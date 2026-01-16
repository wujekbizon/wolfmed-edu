"use client";

import { PathData } from "@/types/careerPathsTypes";
import TestsSelection from "@/app/_components/TestsSelection";
import SimplePathCard from "@/components/SimplePathCard";
import GradientOverlay from "@/components/GradientOverlay";
import TriangleDivider from "@/components/TriangleDivider";
import Image from "next/image";
import Link from "next/link";
import { useInView } from "react-intersection-observer";

export default function SimplePathLayout({
  features,
  description,
  title,
  pricing,
}: PathData) {
  const { ref: heroRef, inView: heroInView } = useInView({ triggerOnce: false, threshold: 0.1 });
  const { ref: featuresRef, inView: featuresInView } = useInView({ triggerOnce: false, threshold: 0.1 });
  const { ref: pricingRef, inView: pricingInView } = useInView({ triggerOnce:false, threshold: 0.1 });
  return (
    <section className="relative @container flex flex-col w-full bg-white p-4 sm:p-6 md:p-8 lg:p-12 gap-8 sm:gap-12 lg:gap-16 overflow-hidden">
      <TriangleDivider
        direction="right"
        className="border-b-[5vh] lg:border-b-[10vh] border-r-transparent border-b-transparent"
      />

      <GradientOverlay />
      <div
        ref={heroRef}
        className={`relative w-full transition-all duration-800 ease-in-out ${
          heroInView ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex flex-col items-center text-center">
          <span className="mb-3 sm:mb-4 inline-block rounded-full bg-white/80 backdrop-blur-sm border border-zinc-200/60 shadow-sm px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-zinc-600">
            Kierunek Edukacyjny
          </span>
          <h1 className="mb-2 lg:mb-4 max-w-2xl text-3xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-700 p-2 leading-14">
            {title}
          </h1>
          <p className="mb-6 sm:mb-8 md:mb-10 max-w-3xl text-zinc-500 text-base sm:text-xl font-normal leading-5 tracking-[-0.14px] text-center">
            Zyskaj solidne przygotowanie teoretyczne i praktyczne niezbędne do
            pracy w roli opiekuna medycznego.
          </p>
          <div className="w-full h-full flex flex-col gap-0 sm:gap-6 2xl:flex-row items-center shadow-xl ring-2 ring-slate-900/10 bg-white rounded-2xl p-4 sm:p-6 md:px-16 md:py-10">
            <TestsSelection />
            <div className="relative min-h-fit w-full flex flex-col lg:flex-row gap-6 lg:gap-8 flex-3/5 rounded-2xl bg-gradient-to-br from-slate-50/50 via-white to-slate-50/30 backdrop-blur-sm ring-1 ring-slate-900/5 shadow-inner p-6 md:p-8 lg:p-10 overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-[#ff9898]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

              <div className="hidden lg:flex flex-col items-center justify-center gap-4 lg:min-w-[200px] xl:min-w-[240px] relative z-10">
                <div className="absolute -top-4 -left-4 text-[120px] text-[#ff9898]/15 font-serif leading-none pointer-events-none">&ldquo;</div>
                <Image
                  className="relative rounded-2xl ring-2 ring-slate-900/10 shadow-lg h-36 w-36 xl:h-40 xl:w-40 object-cover object-top"
                  src="https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5lJJEon5QZL8RnOt9ME3WgkVAFJaXBNK7HC5q"
                  alt="CEO Wolfmed Edukacja"
                  width={160}
                  height={160}
                />
                <div className="flex flex-col items-center gap-1">
                  <p className="text-slate-900 text-xl xl:text-2xl font-light tracking-tight">
                    Kinga Wolfinger
                  </p>
                  <div className="h-px w-12 bg-[#ff9898]/40" />
                  <p className="text-[#ff9898] text-xs xl:text-sm font-medium uppercase tracking-wider">
                    CEO
                  </p>
                  <p className="text-slate-600 text-xs xl:text-sm font-medium">
                    Wolfmed Edukacja
                  </p>
                </div>
              </div>

              <div className="lg:hidden flex flex-col items-center gap-4 relative z-10">
                <Image
                  className="relative rounded-2xl ring-2 ring-slate-900/10 shadow-lg h-32 w-32 object-cover object-top"
                  src="https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5lJJEon5QZL8RnOt9ME3WgkVAFJaXBNK7HC5q"
                  alt="CEO Wolfmed Edukacja"
                  width={128}
                  height={128}
                />
                <div className="flex flex-col items-center gap-1">
                  <p className="text-slate-900 text-xl font-light tracking-tight">
                    Kinga Wolfinger
                  </p>
                  <div className="h-px w-12 bg-[#ff9898]/40" />
                  <p className="text-[#ff9898] text-xs font-medium uppercase tracking-wider">
                    CEO
                  </p>
                  <p className="text-slate-600 text-xs font-medium">
                    Wolfmed Edukacja
                  </p>
                </div>
              </div>

              <div className="flex flex-col justify-center items-start gap-6 flex-1 relative z-10">
                <div className="flex items-center gap-2 w-full">
                  <div className="h-px flex-1 bg-slate-900/10" />
                  <span className="text-slate-500 text-xs @lg:text-sm font-medium uppercase tracking-wider">
                    Rekomendacja
                  </span>
                  <div className="h-px flex-1 bg-slate-900/10" />
                </div>
                <blockquote className="relative">
                  <p className="text-slate-800 text-base @md:text-lg @lg:text-xl font-normal leading-relaxed italic text-center lg:text-left">
                    {description}
                  </p>
                  <span className="absolute -bottom-2 right-0 text-5xl text-[#ff9898]/20 font-serif leading-none">&rdquo;</span>
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </div>
      <section
        aria-labelledby="features-title"
        ref={featuresRef}
        className={`w-full relative transition-all duration-800 ease-in-out ${
          featuresInView ? "opacity-100" : "opacity-0"
        }`}
      >
        <header className="mb-8 sm:mb-12 lg:mb-16 text-center">
          <span className="inline-block rounded-full bg-white/80 backdrop-blur-sm border border-zinc-200/60 shadow-sm text-slate-700 px-3 py-1 text-xs font-medium tracking-wide">
            Co oferujemy
          </span>
          <h2
            id="features-title"
            className="mt-3 text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900"
          >
            Cechy kierunku i narzędzia
          </h2>
          <p className="mt-3 text-zinc-600 text-base md:text-lg">
            Praktyczne moduły i materiały, które realnie pomogą Ci w nauce i
            przygotowaniu do egzaminu.
          </p>
        </header>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features?.map(
            ({ description, title, icon, imgSrc, text, url }, index) => (
              <SimplePathCard
                key={index}
                title={title}
                description={description}
                icon={icon}
                imgSrc={imgSrc}
                text={text}
                url={url}
                titleBtn=""
              />
            )
          )}
        </div>
      </section>

      <section
        aria-labelledby="pricing-title"
        ref={pricingRef}
        className={`w-full flex items-center relative transition-all duration-800 ease-in-out ${
          pricingInView ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="mx-auto w-full max-w-none lg:max-w-6xl px-0 sm:px-6 py-8 sm:py-12 lg:py-16">
          <header className="mb-8 sm:mb-12 lg:mb-16 text-center">
            <span className="inline-block rounded-full bg-white/80 backdrop-blur-sm border border-zinc-200/60 shadow-sm text-slate-700 px-3 py-1 text-xs font-medium tracking-wide">
              Cennik
            </span>
            <h2
              id="pricing-title"
              className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900"
            >
              Plany cenowe
            </h2>
            <p className="mt-3 text-zinc-600 text-base md:text-lg">
              Wybierz plan dopasowany do Twoich potrzeb.
            </p>
          </header>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-stretch">
            {Object.entries(pricing || {})
              .filter(([key]) => key !== 'courseSlug')
              .map(([plan, tierData]) => {
                const tier = tierData as { price: string; priceId: string; accessTier: string; features: string[] }
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
                      {isPremium ? (
                        <>
                          <span className="self-end mb-4 inline-flex items-center gap-1.5 text-[11px] md:text-xs font-semibold uppercase tracking-wide px-3 py-1.5 rounded-full bg-gradient-to-r from-slate-800 via-[#ff9898] to-[#ffc5c5] text-white shadow-md">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            Promocja -69%
                          </span>
                          <h3 className="text-xl md:text-2xl font-extrabold mb-4 text-slate-900">
                            {plan}
                          </h3>
                          <div className="mb-4">
                            <span className="text-lg text-zinc-500 line-through">159,99 zł</span>
                            <div className="flex items-baseline gap-2 mt-2">
                              <span className="text-4xl md:text-5xl font-bold text-zinc-900">49,99</span>
                              <span className="text-2xl text-zinc-600">zł</span>
                            </div>
                            <p className="text-sm text-zinc-500 mt-1">Jednorazowa wpłata · Oferta limitowana</p>
                          </div>
                          <p className="text-base md:text-lg text-zinc-700 mb-6 leading-relaxed">
                            Odblokuj wszystkie funkcje premium dla Opiekuna Medycznego. Wspieraj rozwój platformy i zyskaj dostęp do zaawansowanych narzędzi edukacyjnych.
                          </p>
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                            <p className="text-sm text-amber-900 font-medium">⏰ Ta oferta jest dostępna tylko przez ograniczony czas</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="self-end mb-2 text-[11px] md:text-xs font-semibold uppercase tracking-wide px-3 py-1.5 rounded-full bg-slate-900/5 text-slate-700">
                            Dostęp darmowy
                          </span>
                          <h3 className="text-xl md:text-2xl font-extrabold mb-2 text-slate-900">
                            {plan}
                          </h3>
                          <p className="text-3xl md:text-4xl font-bold mb-4 md:mb-6 tracking-tight text-slate-700">
                            {tier.price}
                          </p>
                          <ul className="grow space-y-3 md:space-y-4 text-left w-full max-w-sm text-zinc-700">
                            {tier.features.map((feature: string, i: number) => (
                              <li
                                key={i}
                                className="flex items-start gap-3 text-sm md:text-base leading-relaxed"
                              >
                                <svg
                                  className="mt-0.5 w-5 h-5 md:w-6 md:h-6 shrink-0 text-slate-500"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  viewBox="0 0 24 24"
                                  aria-hidden="true"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}

                      <div className="mt-auto w-full pt-6 md:pt-8">
                        <Link
                          href={isPremium ? "/wsparcie-projektu" : "/panel"}
                          className={`
                          inline-flex w-full items-center justify-center rounded-xl px-5 py-3.5
                          font-semibold transition-colors duration-200
                          ${
                            isPremium
                              ? "bg-slate-900 text-white hover:bg-slate-800"
                              : "bg-slate-700 text-white hover:bg-slate-800"
                          }
                        `}
                        >
                          {isPremium
                            ? "Skorzystaj z promocji"
                            : "Rozpocznij naukę"}
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        </div>
      </section>
    </section>
  );
}
