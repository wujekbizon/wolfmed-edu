import type { StringListOrGrouped as StringListOrGroupedType } from '@/types/diagnozyTypes'

export default function StringListOrGrouped({
  data,
}: {
  data: StringListOrGroupedType
}) {
  if (Array.isArray(data)) {
    return (
      <ul className="list-disc pl-5 space-y-1.5 text-sm text-zinc-600">
        {data.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    )
  }

  return (
    <div className="space-y-4">
      {data.groups.map((group) => (
        <div key={group.label}>
          <h4 className="text-sm font-semibold text-zinc-700 mb-1.5">{group.label}</h4>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-zinc-600">
            {group.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
