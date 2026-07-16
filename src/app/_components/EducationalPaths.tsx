"use client";

import EducationalPathCard from "@/components/EducationalPathCard";
import { CAREGIVER, INFO, NURSE } from "@/constants/educationalPathCards";

export default function EducationPathsSection() {
  return (
    <section id="explore" className="flex flex-col w-full py-8 md:py-12 px-4 md:px-12 xl:px-24 gap-8 ">
      <div className="container relative mx-auto px-3 sm:px-4">
        <div className="mb-8 sm:mb-12 flex flex-col items-center text-center">
          <span className="mb-3 sm:mb-4 inline-flex items-center gap-1.5 rounded-full border border-red-300/50 bg-white/60 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-red-500 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
            Kariera Medyczna
          </span>
          <h1 className="mb-4 lg:mb-6 max-w-2xl text-3xl sm:text-4xl md:text-5xl font-bold text-zinc-800 px-2 leading-tight">
            Twoja <span className="animate-pulse text-[#ff5b5b]">ścieżka</span> w
            świecie medycyny
          </h1>
          <p className="mb-6 sm:mb-8 max-w-2xl text-zinc-500 text-base sm:text-lg font-normal leading-7 text-center">
            Znajdź program edukacyjny idealnie dopasowany do Twoich potrzeb,
            tempa nauki i planów zawodowych.
          </p>
        </div>
      </div>
      <div className="relative overflow-hidden p-4 sm:p-8 bg-gradient-to-b from-zinc-800/90 to-zinc-950/90 rounded-3xl border-3 border-white shadow-2xl shadow-zinc-950/50 ring-1 ring-inset ring-white/10">
        {/* Interior depth: a warm radial bloom from the top and a faint dot grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(255,91,91,0.07),transparent_55%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:radial-gradient(rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:22px_22px]"
        />
        <div className="relative z-10 flex flex-col divide-y divide-white/10">
          <EducationalPathCard {...CAREGIVER} />
          <EducationalPathCard
            {...NURSE}
            className="flex flex:col lg:flex-row-reverse gap-20"
          />
          <EducationalPathCard {...INFO} vertical />
        </div>
      </div>
    </section>
  );
}