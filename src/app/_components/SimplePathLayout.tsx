"use client";

import { PathData } from "@/types/careerPathsTypes";
import TestsSelection from "@/app/_components/TestsSelection";
import SimplePathCard from "@/components/SimplePathCard";
import GradientOverlay from "@/components/GradientOverlay";
import TriangleDivider from "@/components/TriangleDivider";
import Image from "next/image";
import Link from "next/link";
import { useInView } from "react-intersection-observer";
import CoursePricingCard from "@/components/CoursePricingCard";

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
              .map(([tierName, tierData]) => {
                const tier = tierData as { price: string; priceId: string; accessTier: string; features: string[] }
                const isPremium = tierName.toLowerCase().includes('premium')
                return (
                  <CoursePricingCard
                    key={tierName}
                    tierName={tierName}
                    price={tier.price}
                    priceId={tier.priceId}
                    courseSlug={pricing?.courseSlug || ''}
                    accessTier={tier.accessTier}
                    features={tier.features}
                    isPremium={isPremium}
                  />
                )
              })}
          </div>
        </div>
      </section>
    </section>
  );
}
