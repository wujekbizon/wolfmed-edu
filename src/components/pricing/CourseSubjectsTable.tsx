import type { CourseSubjectYear } from '@/types/pricingTypes'

export default function CourseSubjectsTable({ years }: { years: CourseSubjectYear[] }) {
  const total = years.reduce((sum, year) => sum + year.subjects.length, 0)

  return (
    <div className="flex flex-col gap-6">
      {years.map((year) => (
        <section
          key={year.year}
          className="rounded-3xl bg-white ring-1 ring-zinc-200 shadow-sm overflow-hidden"
        >
          <div className="flex items-baseline justify-between bg-zinc-50/70 py-3 px-5 sm:px-6">
            <h3 className="text-sm font-semibold text-slate-900">{year.label}</h3>
            <span className="text-xs text-zinc-500">
              {year.subjects.length} przedmiotów
            </span>
          </div>
          <ul className="divide-y divide-zinc-100">
            {year.subjects.map((subject) => (
              <li
                key={subject.category}
                className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-3 px-5 sm:px-6"
              >
                <span className="grow text-sm text-zinc-700">{subject.title}</span>
                <span className="text-xs text-zinc-500">{subject.semester}</span>
                <span className="text-xs font-medium text-slate-600 tabular-nums">
                  {subject.ects} ECTS
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <p className="text-center text-sm text-zinc-500">
        Łącznie {total} przedmiotów w programie kursu.
      </p>
    </div>
  )
}
