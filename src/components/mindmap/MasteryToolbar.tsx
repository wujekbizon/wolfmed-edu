import { MASTERY_COLORS } from "@/lib/mindmap/design"
import type { MasteryLevel } from "@/lib/mindmap/types"

const OPTIONS: { level: MasteryLevel; label: string }[] = [
  { level: "unseen", label: "Nie znam" },
  { level: "learning", label: "Uczę się" },
  { level: "mastered", label: "Umiem" },
]

interface MasteryToolbarProps {
  current: MasteryLevel | undefined
  onSelect: (level: MasteryLevel) => void
}

export default function MasteryToolbar({ current, onSelect }: MasteryToolbarProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-zinc-900/90 p-1 shadow-lg backdrop-blur">
      {OPTIONS.map(({ level, label }) => {
        const active = current === level
        return (
          <button
            key={level}
            type="button"
            onClick={() => onSelect(level)}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
              active ? "text-white" : "text-zinc-400 hover:text-zinc-100"
            }`}
            style={active ? { background: `${MASTERY_COLORS[level]}33` } : undefined}
          >
            <span className="h-2 w-2 rounded-full" style={{ background: MASTERY_COLORS[level] }} />
            {label}
          </button>
        )
      })}
    </div>
  )
}
