"use client";


import EducationalPathCard from "@/components/EducationalPathCard";
import { CAREGIVER, NURSE} from "@/constants/educationalPathCards";

export default function EducationPathsSection() {
    return (
      <section className="flex flex-col w-full bg-slate-900 py-16 px-4 md:px-12 xl:px-24 gap-8">
        <div className="container relative mx-auto px-3 sm:px-4">
        {/* Header Section */}
        <div className="mb-10 sm:mb-16 flex flex-col items-center text-center">
          <span className="mb-3 sm:mb-4 inline-block rounded-full bg-red-100 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-red-800">
            Kariera Medyczna
          </span>
          <h1 className="mb-4 sm:mb-6 max-w-2xl text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white px-2 leading-14">
          Twoja <span className="animate-pulse text-rose-400">ścieżka</span> w świecie medycyny
          </h1>
          <p className="mb-6 sm:mb-8 max-w-3xl text-[#9ba2b2] text-base sm:text-xl font-normal leading-8 tracking-[-0.14px] text-center">
          Znajdź program edukacyjny idealnie dopasowany do Twoich potrzeb, tempa nauki i planów zawodowych.
          </p>
        </div>
      </div>
      <div className="flex flex-col py-4 sm:py-16 bg-slate-950 rounded-3xl">
          <EducationalPathCard {...CAREGIVER} />
          <EducationalPathCard {...NURSE} className="flex flex:col lg:flex-row-reverse gap-20" />
      </div>
      </section>
    );
  } 