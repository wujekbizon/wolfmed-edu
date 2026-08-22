// One row of the Przewodnik form: label cell + content cell, unlocked in order.
// The container can't clip (dropdown panels overflow it), so first/last rows
// round their own corners to match the wrapper's rounded-xl.
export default function PrzewodnikFormRow({
  label,
  active,
  first = false,
  last = false,
  children,
}: {
  label: string
  active: boolean
  first?: boolean
  last?: boolean
  children: React.ReactNode
}) {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-[190px_1fr] ${
        first ? '' : 'border-t border-zinc-200'
      } ${active ? '' : 'opacity-50'}`}
    >
      <div
        className={`px-4 py-3 bg-zinc-50 text-xs font-semibold text-zinc-600 uppercase tracking-wide
          md:border-r md:border-zinc-200
          ${first ? 'rounded-t-xl md:rounded-tr-none' : ''}
          ${last ? 'md:rounded-bl-xl' : ''}`}
      >
        {label}
      </div>
      <div className={`px-4 py-3 min-w-0 ${last ? 'rounded-b-xl md:rounded-bl-none' : ''}`}>
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
