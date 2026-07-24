// One row of the Przewodnik form: label cell + content cell, unlocked in order
export default function PrzewodnikFormRow({
  label,
  active,
  first = false,
  children,
}: {
  label: string
  active: boolean
  first?: boolean
  children: React.ReactNode
}) {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-[190px_1fr] ${
        first ? '' : 'border-t border-zinc-200'
      } ${active ? '' : 'opacity-50'}`}
    >
      <div className="px-4 py-3 bg-zinc-50 text-xs font-semibold text-zinc-600 uppercase tracking-wide md:border-r md:border-zinc-200">
        {label}
      </div>
      <div className="px-4 py-3">
        {active ? (
          children
        ) : (
          <p className="text-xs text-zinc-400 italic">
            Najpierw uzupełnij poprzednie pole.
          </p>
        )}
      </div>
    </div>
  )
}
