"use client";

import { PathData } from "@/types/careerPathsTypes";
import TestsSelection from "@/app/_components/TestsSelection";
import SimplePathCard from "@/components/SimplePathCard";
import GradientOverlay from "@/components/GradientOverlay";
import TriangleDivider from "@/components/TriangleDivider";

export default function SimplePathLayout({
  features,
  description,
  title,
  pricing,
}: PathData) {
  return (
    <section className="relative @container flex flex-col w-full bg-white px-4 sm:px-8 md:px-16 gap-12 overflow-hidden">
       {/* <div className="relative w-full h-[10vw] overflow-hidden">
        <TriangleDivider
          direction="right"
          className="absolute bottom-0 border-t-transparent border-r-white border-b-[10vw] border-b-white"
        />
      </div> */}
      <TriangleDivider direction="right" className="border-b-[5vh] lg:border-b-[10vh] border-r-transparent border-b-transparent" />
      
      <GradientOverlay />
      <div className="relative w-full">
        <div className="flex flex-col items-center text-center">
          <span className="mb-3 sm:mb-4 inline-block rounded-full bg-white px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-zinc-600">
            Kierunek Edukacyjny
          </span>
          <h1 className="mb-2 lg:mb-4 max-w-2xl text-3xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-700 p-2 leading-14 underline">
            {title}
          </h1>
          <p className="mb-8 sm:mb-16 max-w-3xl text-zinc-500 text-base sm:text-xl font-normal leading-5 tracking-[-0.14px] text-center">
            Zyskaj solidne przygotowanie teoretyczne i praktyczne niezbędne do pracy w roli opiekuna medycznego. 
          </p>
          <div className="w-full h-full flex flex-col-reverse xl:flex-row items-center shadow-lg bg-red-50/40 rounded-2xl border border-zinc-900/20 p-4 sm:p-6 md:p-10">
            <p className=" text-zinc-500 flex-1/2 text-base @md:text-lg font-normal leading-8 tracking-[-0.14px] text-left md:text-left">
              {description}
            </p>
            <TestsSelection />
          </div>
        </div>
      </div>
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
      <div className="mb-8">
        <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-4">
          Cenna kursu
        </h2>
        <div className="space-y-4">
          {Object.entries(pricing || {}).map(([plan, price]) => (
            <div key={plan} className="bg-slate-50 p-4 rounded-lg">
              <p className="text-slate-800 font-medium capitalize">{plan}</p>
              <p className="text-slate-600">{price}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
