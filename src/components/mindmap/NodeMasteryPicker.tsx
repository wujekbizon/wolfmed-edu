import { MASTERY_COLORS, MASTERY_OPTIONS } from "@/lib/mindmap/design"
import type { MasteryLevel } from "@/lib/mindmap/types"

export default function NodeMasteryPicker({
  current,
  onSelect,
}: {
  current: MasteryLevel | undefined
  onSelect: (level: MasteryLevel) => void
}) {
  return (
    <div className="mt-3">
      <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-500">Twój poziom</p>
      <div className="flex gap-1.5">
        {MASTERY_OPTIONS.map(({ level, label }) => {
          const active = current === level
          return (
            <button
              key={level}
              type="button"
              onClick={() => onSelect(level)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium transition-colors ${
                active ? "text-white" : "bg-white/5 text-zinc-400 hover:text-zinc-100"
              }`}
              style={active ? { background: `${MASTERY_COLORS[level]}33` } : undefined}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: MASTERY_COLORS[level] }} />
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
