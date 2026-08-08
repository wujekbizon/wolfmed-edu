export default function CourseSubjectList({ titles }: { titles: string[] }) {
  return (
    <div className="mt-6 rounded-3xl bg-white ring-1 ring-zinc-200 shadow-sm p-5 sm:p-6">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Kategorie w kursie ({titles.length})
      </h3>
      <ul className="mt-3 flex flex-wrap gap-2">
        {titles.map((title) => (
          <li
            key={title}
            className="rounded-full bg-zinc-50 ring-1 ring-zinc-200 px-3 py-1 text-xs text-zinc-600"
          >
            {title}
          </li>
        ))}
      </ul>
    </div>
  )
}
