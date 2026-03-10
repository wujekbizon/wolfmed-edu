"use client";

import EducationalPathCard from "@/components/EducationalPathCard";
import { CAREGIVER, INFO, NURSE } from "@/constants/educationalPathCards";

export default function EducationPathsSection() {
  return (
    <section className="flex flex-col w-full py-8 md:py-12 px-4 md:px-12 xl:px-24 gap-8">
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
      <div className="h-8 w-full rounded-t-3xl bg-linear-to-b from-transparent to-zinc-900/90 -mb-1" />
      <div className="flex flex-col divide-y divide-white/10 p-4 sm:p-8 bg-zinc-900/90 rounded-3xl border border-white/5">
        <EducationalPathCard {...CAREGIVER} />
        <EducationalPathCard
          {...NURSE}
          className="flex flex:col lg:flex-row-reverse gap-20"
        />
        <EducationalPathCard {...INFO} vertical />
      </div>
    </section>
  );
}
