"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import subjectPlaceholder from "@/images/modules.jpg";
import type { CurriculumBlock } from "@/types/careerPathsTypes";
import { groupByYear } from "@/helpers/groupByYear";

type CurriculumMapProps = {
  curriculum: CurriculumBlock[];
};

export default function CurriculumMap({ curriculum }: CurriculumMapProps) {
  const grouped = useMemo(() => groupByYear(curriculum), [curriculum]);
  const years = useMemo(
    () =>
      Object.keys(grouped)
        .map(Number)
        .sort((a, b) => a - b),
    [grouped]
  );
  const [expandedYears, setExpandedYears] = useState<Set<number>>(
    new Set<number>(years.length ? [years[0] as number] : [])
  );
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set()
  );

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

  return (
    <div className="space-y-8">
      {years.map((year, yearIndex) => {
        const isYearOpen = expandedYears.has(year);
        const blocks = grouped[year];
        const totalHours = blocks?.reduce(
          (sum, b) =>
            sum + b.subjects.reduce((s, sub) => s + (sub.hours || 0), 0),
          0
        );
        const totalEcts = blocks?.reduce(
          (sum, b) =>
            sum + b.subjects.reduce((s, sub) => s + (sub.ects || 0), 0),
          0
        );
        const allSubjectNames =
          blocks?.flatMap((b) => b.subjects.map((s) => s.name)) ?? [];

        return (
          <section
            key={year}
            aria-labelledby={`year-${year}`}
            className="relative"
          >
            <header className="flex items-start gap-3">
              <div className="flex-1">
                <button
                  type="button"
                  aria-expanded={isYearOpen}
                  aria-controls={`year-panel-${year}`}
                  className={`w-full min-h-[250px] relative text-left border border-zinc-800/50 p-4 shadow-md shadow-zinc-800/20 bg-slate-100 transition`}
                  onClick={() => toggleYear(year)}
                >
                  <div className="h-full w-full flex flex-col justify-between gap-4">
                    <h3
                      id={`year-${year}`}
                      className="text-lg sm:text-xl font-normal text-slate-100 bg-slate-700 p-2"
                    >
                      Syllabus przedmiotów
                      <span className="font-semibold text-slate-100">
                        {" "}
                        - Rok {year} studiów
                      </span>
                    </h3>
                    <div className="w-full flex flex-col gap-2">
                      <div className="flex flex-row flex-wrap items-center justify-center sm:justify-between border px-2 py-1 bg-white">
                        <span>Godziny zajęć (wg planu studiów) </span>
                        <p
                          className={`inline-flex items-center justify-center px-2 py-1 text-red-500 `}
                        >
                          {totalHours} h
                        </p>
                      </div>
                      <div className="flex flex-row flex-wrap items-center justify-center sm:justify-between border px-2 py-1 bg-white">
                        <span>Sumaryczna liczba punktów ECTS</span>
                        <span
                          className={`inline-flex items-center justify-center gap-1 px-2 py-1 text-red-500`}
                        >
                          {totalEcts} ECTS
                        </span>
                      </div>
                    </div>
                    {allSubjectNames && (
                      <div className="flex flex-col gap-2">
                        <p className="font-medium text-slate-900 underline">
                          Zakres wiedzy:{" "}
                        </p>
                        <div className="flex flex-row gap-2 flex-wrap">

                        {allSubjectNames.map((item) => (
                          <span
                          className={`text-base text-slate-700 font-semibold border px-2 bg-white`}
                          key={item}
                          >
                            {item}
                          </span>
                        ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end items-center">

                  <span
                    className={`cursor-pointer inline-flex items-center h-8 w-8 bg-red-500/20 animate-pulse border justify-center rounded-full text-zinc-800 transition ${
                      isYearOpen ? "rotate-180" : "rotate-0"
                    }`}
                    aria-hidden
                    >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      >
                      <path
                        d="M6 9l6 6 6-6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        />
                    </svg>
                  </span>
                        </div>
                </button>

                <div
                  id={`year-panel-${year}`}
                  className={`overflow-hidden transition-[max-height,opacity] duration-500 ease-in-out ${
                    isYearOpen
                      ? "max-h-[2100px] opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <ul className=" space-y-7 border p-4">
                    {blocks?.map(({ id, module, image, subjects }) => {
                      const isModuleOpen = expandedModules.has(id);
                      const moduleHours = subjects.reduce(
                        (s, sub) => s + (sub.hours || 0),
                        0
                      );
                      return (
                        <li
                          key={id}
                          className="relative overflow-hidden rounded-2xl ring-1 ring-zinc-200 bg-white/80"
                        >
                          <div className="absolute inset-0">
                            <Image
                              src={image}
                              alt={module}
                              fill
                              className="object-cover "
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/60 to-white/30" />
                          </div>
                          <button
                            type="button"
                            aria-expanded={isModuleOpen}
                            aria-controls={`module-panel-${id}`}
                            className="relative w-full text-left p-5 sm:p-6 hover:bg-white/60 rounded-2xl transition"
                            onClick={() => toggleModule(id)}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className={`text-sm`}>Moduł</p>
                                <h4 className="text-lg sm:text-xl font-semibold text-slate-900">
                                  {module}
                                </h4>
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                  <span
                                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs}`}
                                  >
                                    {moduleHours} h
                                  </span>
                                  <span className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs bg-white/60 text-slate-700 border-slate-200">
                                    {subjects.length} przedmiotów
                                  </span>
                                </div>
                              </div>
                              <span
                                className={`ml-auto inline-flex h-8 w-8 items-center justify-center rounded-full border text-slate-700 transition ${
                                  isModuleOpen ? "rotate-180" : "rotate-0"
                                }`}
                                aria-hidden
                              >
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path
                                    d="M6 9l6 6 6-6"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </span>
                            </div>
                          </button>

                          <div
                            id={`module-panel-${id}`}
                            className={`relative overflow-hidden transition-[max-height,opacity] duration-500 ease-in-out ${
                              isModuleOpen
                                ? "max-h-[2400px] opacity-100"
                                : "max-h-0 opacity-0"
                            }`}
                          >
                            <div className="relative px-5 sm:px-6 pb-6 sm:pb-8">
                              <div className="rounded-xl border border-white/60 bg-white/70 backdrop-blur-sm p-4 sm:p-5">
                                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 items-stretch">
                                  {subjects.map((subj, idx) => (
                                    <li
                                      key={idx}
                                      className="relative overflow-hidden rounded-lg border border-zinc-200 p-3 sm:p-4 text-center shadow-sm hover:shadow transition h-[150px] sm:h-[170px]"
                                    >
                                      <Image
                                        src={subjectPlaceholder}
                                        alt="Tło przedmiotu"
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, 400px"
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-white/75 to-white/55" />
                                      <div className="relative flex h-full flex-col items-center justify-between">
                                        <p className="px-1 text-sm sm:text-base font-medium text-slate-900 line-clamp-2">
                                          {subj.name}
                                        </p>
                                        <div className="mb-0.5 flex flex-wrap justify-center gap-2 text-[11px] sm:text-xs text-zinc-700">
                                          <span className="inline-flex items-center rounded-full border border-zinc-200 bg-slate-50 px-2 py-0.5">
                                            {subj.hours}h
                                          </span>
                                          {typeof subj.ects === "number" && (
                                            <span className="inline-flex items-center rounded-full border border-zinc-200 bg-slate-50 px-2 py-0.5">
                                              {subj.ects} ECTS
                                            </span>
                                          )}
                                          {typeof subj.form === "string" && (
                                            <span className="inline-flex items-center rounded-full border border-zinc-200 bg-slate-50 px-2 py-0.5">
                                              Forma: {subj.form}
                                            </span>
                                          )}
                                          {subj.exam !== undefined && (
                                            <span
                                              className={`inline-flex items-center rounded-full px-2 py-0.5 border ${
                                                subj.exam
                                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                                  : "border-zinc-200 bg-slate-50 text-zinc-700"
                                              }`}
                                            >
                                              {subj.exam
                                                ? "Egzamin"
                                                : "Zaliczenie"}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </div>
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
