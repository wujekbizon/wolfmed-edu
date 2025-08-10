"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { CurriculumBlock } from "@/types/careerPathsTypes";
import { groupByYear } from "@/helpers/groupByYear";
import modulesImg from "@/images/modules.jpg";
import examsImg from "@/images/exams.jpg";
import proceduresImg from "@/images/procedures.jpg";
import nurseImg from "@/images/nurse.jpg";

type CurriculumMapProps = {
  curriculum: CurriculumBlock[];
};


export default function CurriculumMap({ curriculum }: CurriculumMapProps) {
  const grouped = useMemo(() => groupByYear(curriculum), [curriculum]);
  const years = useMemo(() => Object.keys(grouped).map(Number).sort((a, b) => a - b), [grouped]);
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set<number>(years.length ? [years[0] as number] : []));
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  if (!curriculum || curriculum.length === 0) {
    return (
      <div className="w-full rounded-2xl border border-zinc-200 bg-white p-6 text-zinc-600">
        Brak zdefiniowanego programu nauczania.
      </div>
    );
  }

  const toggleYear = (year: number) => {
    setExpandedYears((prev) => {
      const next = new Set(prev);
      if (next.has(year)) next.delete(year);
      else next.add(year);
      return next;
    });
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  const yearTheme = (year: number) => {
    switch (year) {
      case 1:
        return {
          dot: "from-rose-500 to-red-500",
          buttonBg: "from-rose-50 to-white",
          ring: "ring-rose-200",
          accentText: "text-rose-700",
          chip: "bg-rose-100 text-rose-700 border-rose-200",
        };
      case 2:
        return {
          dot: "from-indigo-500 to-fuchsia-500",
          buttonBg: "from-indigo-50 to-white",
          ring: "ring-indigo-200",
          accentText: "text-indigo-700",
          chip: "bg-indigo-100 text-indigo-700 border-indigo-200",
        };
      default:
        return {
          dot: "from-emerald-500 to-teal-500",
          buttonBg: "from-emerald-50 to-white",
          ring: "ring-emerald-200",
          accentText: "text-emerald-700",
          chip: "bg-emerald-100 text-emerald-700 border-emerald-200",
        };
    }
  };

  const pickModuleImage = (moduleTitle: string) => {
    const lower = moduleTitle.toLowerCase();
    if (lower.includes("podstaw")) return modulesImg;
    if (lower.includes("egz") || lower.includes("badania")) return examsImg;
    if (lower.includes("chirurg") || lower.includes("anestez") || lower.includes("zagrożeniu")) return nurseImg;
    if (lower.includes("procedur") || lower.includes("opieki")) return proceduresImg;
    return modulesImg;
  };

  return (
    <div className="space-y-8">
      {years.map((year, yearIndex) => {
        const isYearOpen = expandedYears.has(year);
        const blocks = grouped[year];
        const totalHours = blocks?.reduce((sum, b) => sum + b.subjects.reduce((s, sub) => s + (sub.hours || 0), 0), 0);
        const totalEcts = blocks?.reduce((sum, b) => sum + b.subjects.reduce((s, sub) => s + (sub.ects || 0), 0), 0);
        const theme = yearTheme(year);

        return (
          <section key={year} aria-labelledby={`year-${year}`} className="relative">
            {/* timeline connector */}
            {yearIndex < years.length - 1 && (
              <div className="absolute left-4 sm:left-6 top-12 bottom-0 w-px bg-gradient-to-b from-zinc-300 to-transparent" aria-hidden />
            )}

            <header className="flex items-start gap-3">
              <div className="relative mt-1">
                <span className={`flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-gradient-to-br ${theme.dot} text-white text-xs sm:text-sm font-bold shadow`}>
                  {year}
                </span>
              </div>
              <div className="flex-1">
                <button
                  type="button"
                  aria-expanded={isYearOpen}
                  aria-controls={`year-panel-${year}`}
                  className={`w-full text-left rounded-2xl border border-white/0 ring-1 ${theme.ring} bg-gradient-to-br ${theme.buttonBg} p-4 sm:p-5 hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-black/0 transition`}
                  onClick={() => toggleYear(year)}
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <h3 id={`year-${year}`} className="text-lg sm:text-xl font-semibold text-slate-900">
                        Rok {year}
                      </h3>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs ${theme.chip}`}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="-mt-[2px]">
                            <path d="M3 7h18M3 12h18M3 17h18" />
                          </svg>
                          {totalHours} h
                        </span>
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs ${theme.chip}`}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="-mt-[2px]">
                            <path d="M12 3l9 6-9 6-9-6 9-6z" />
                          </svg>
                          {totalEcts} ECTS
                        </span>
                      </div>
                    </div>
                    <span
                      className={`ml-4 inline-flex h-8 w-8 items-center justify-center rounded-full border text-slate-700 transition ${
                        isYearOpen ? "rotate-180" : "rotate-0"
                      }`}
                      aria-hidden
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>
                </button>

                <div
                  id={`year-panel-${year}`}
                  className={`overflow-hidden transition-[max-height,opacity] duration-500 ease-in-out ${
                    isYearOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <ul className="mt-4 space-y-5">
                    {blocks?.map((block) => {
                      const isModuleOpen = expandedModules.has(block.id);
                      const moduleHours = block.subjects.reduce((s, sub) => s + (sub.hours || 0), 0);
                      const image = pickModuleImage(block.module);
                      return (
                        <li key={block.id} className="relative overflow-hidden rounded-2xl ring-1 ring-zinc-200 bg-white/80">
                          <div className="absolute inset-0">
                            <Image src={image} alt="Tło modułu" fill className="object-cover opacity-30" sizes="(max-width: 768px) 100vw, 800px" />
                            <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/60 to-white/30" />
                          </div>

                          <button
                            type="button"
                            aria-expanded={isModuleOpen}
                            aria-controls={`module-panel-${block.id}`}
                            className="relative w-full text-left p-5 sm:p-6 hover:bg-white/60 rounded-2xl transition"
                            onClick={() => toggleModule(block.id)}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className={`text-sm ${theme.accentText}`}>Moduł</p>
                                <h4 className="text-lg sm:text-xl font-semibold text-slate-900">{block.module}</h4>
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs ${theme.chip}`}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="-mt-[2px]">
                                      <path d="M3 7h18M3 12h18M3 17h18" />
                                    </svg>
                                    {moduleHours} h
                                  </span>
                                  <span className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs bg-white/60 text-slate-700 border-slate-200">
                                    {block.subjects.length} przedmiotów
                                  </span>
                                </div>
                              </div>
                              <span
                                className={`ml-auto inline-flex h-8 w-8 items-center justify-center rounded-full border text-slate-700 transition ${
                                  isModuleOpen ? "rotate-180" : "rotate-0"
                                }`}
                                aria-hidden
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </span>
                            </div>
                          </button>

                          <div
                            id={`module-panel-${block.id}`}
                            className={`relative overflow-hidden transition-[max-height,opacity] duration-500 ease-in-out ${
                              isModuleOpen ? "max-h-[1200px] opacity-100" : "max-h-0 opacity-0"
                            }`}
                          >
                            <div className="relative px-5 sm:px-6 pb-5 sm:pb-6">
                              <ul className="rounded-xl border border-white/60 bg-white/70 backdrop-blur-sm divide-y divide-zinc-200">
                                {block.subjects.map((subj, idx) => (
                                  <li key={idx} className="py-3 flex items-start gap-4 px-4">
                                    <span className={`mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white text-[11px]`}>{idx + 1}</span>
                                    <div className="flex-1">
                                      <p className="text-sm sm:text-base font-medium text-slate-900">{subj.name}</p>
                                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-zinc-700">
                                        <span className="inline-flex items-center gap-1">
                                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="-mt-[2px]"><path d="M3 7h18M3 12h18M3 17h18"/></svg>
                                          {subj.hours}h
                                        </span>
                                        {typeof subj.ects === "number" && (
                                          <span className="inline-flex items-center gap-1">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="-mt-[2px]"><path d="M12 3l9 6-9 6-9-6 9-6z"/></svg>
                                            {subj.ects} ECTS
                                          </span>
                                        )}
                                        {typeof subj.form === "string" && <span>Forma: {subj.form}</span>}
                                        {subj.exam !== undefined && (
                                          <span className={`inline-flex items-center gap-1 ${subj.exam ? "text-emerald-600" : "text-zinc-600"}`}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="-mt-[2px]">
                                              {subj.exam ? (
                                                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                                              ) : (
                                                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                                              )}
                                            </svg>
                                            {subj.exam ? "Egzamin" : "Zaliczenie"}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </header>
          </section>
        );
      })}
    </div>
  );
}


