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
    <section className="relative @container flex flex-col w-full bg-white p-4 sm:p-8 md:p-16 gap-12 overflow-hidden">
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
          <span className="mb-3 sm:mb-4 inline-block rounded-full bg-white px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-zinc-600">
            Kierunek Edukacyjny
          </span>
          <h1 className="mb-2 lg:mb-4 max-w-2xl text-3xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-700 p-2 leading-14 underline">
            {title}
          </h1>
          <p className="mb-8 sm:mb-16 max-w-3xl text-zinc-500 text-base sm:text-xl font-normal leading-5 tracking-[-0.14px] text-center">
            Zyskaj solidne przygotowanie teoretyczne i praktyczne niezbędne do
            pracy w roli opiekuna medycznego.
          </p>
          <div className="w-full h-full flex flex-col gap-0 sm:gap-6 2xl:flex-row items-center shadow-lg bg-white rounded-2xl border border-zinc-900/20 p-4 sm:p-6 md:px-16 md:py-10">
            <TestsSelection />
            <div className="min-h-full lg:min-h-[800px] w-full flex flex-col justify-around items-center gap-8 @sm:gap-16 flex-3/5 rounded-2xl bg-black/5 p-4 md:p-8 lg:p-12">
              <h2 className="text-zinc-950 text-lg @md:text-xl @lg:text-2xl font-semibold text-center">
                Rekomendacja Prezes Wolfmed Edukacja
              </h2>
              <div className="flex flex-col items-center">
                <p className="max-w-4xl italic border-b border-t border-slate-950/20 py-8 text-zinc-900 text-base @md:text-lg @lg:text-xl xl:text-2xl font-normal leading-8 @lg:leading-10 tracking-[-0.14px] text-center">
                  {description}
                </p>
              </div>
              <div className="flex flex-col items-center w-full">
                <Image
                  className="rounded-full border border-zinc-900/50 h-32 w-32 md:h-40 md:w-40 object-cover object-top"
                  src="https://utfs.io/a/zw3dk8dyy9/UVAwLrIxs2k5lJJEon5QZL8RnOt9ME3WgkVAFJaXBNK7HC5q"
                  alt="CEO Wolfmed Edukacja"
                  width={150}
                  height={150}
                />
                <p className="text-black text-2xl md:text-3xl text-center font-thin mt-2">
                  Kinga Wolfinger
                </p>
                <p className="text-red-500 text-sm @lg:text-base @xl:text-lg font-normal text-center">
                  CEO Wolfmed Edukacja
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <section
        aria-labelledby="features-title"
        ref={featuresRef}
        className={`w-full relative p-0 lg:p-4 xl:p-8 2xl:p-16 transition-all duration-800 ease-in-out ${
          featuresInView ? "opacity-100" : "opacity-0"
        }`}
      >
        <header className="mb-8 sm:mb-12 lg:mb-16 text-center">
          <span className="inline-block rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-xs font-medium tracking-wide">
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

        <div className="grid gap-10 grid-cols-[repeat(auto-fit,_minmax(280px,_1fr))] justify-items-center">
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
        className={`w-full min-h-[65vh] flex items-center relative transition-all duration-800 ease-in-out ${
          pricingInView ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="mx-auto w-full max-w-none lg:max-w-6xl px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
          <header className="mb-8 sm:mb-12 lg:mb-16 text-center">
            <span className="inline-block rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-xs font-medium tracking-wide">
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
            {Object.entries(pricing || {}).map(
              ([plan, { price, features }]) => {
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

                      <h3 className="text-xl md:text-2xl font-extrabold mb-2 text-slate-900">
                        {plan}
                      </h3>
                      <p className="text-3xl md:text-4xl font-bold mb-4 md:mb-6 tracking-tight text-slate-700">
                        {price}
                      </p>

                      <ul className="grow space-y-3 md:space-y-4 text-left w-full max-w-sm text-zinc-700">
                        {features.map((feature, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-3 text-sm md:text-base leading-relaxed"
                          >
                            <svg
                              className="mt-0.5 w-5 h-5 md:w-6 md:h-6 flex-shrink-0 text-slate-500"
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

                      <div className="mt-auto w-full pt-6 md:pt-8">
                        <Link
                          href="/sign-up"
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
                            ? "Wybierz Premium"
                            : "Rozpocznij za darmo"}
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
