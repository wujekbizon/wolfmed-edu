import { MASTERY_COLORS, MASTERY_OPTIONS } from "@/lib/mindmap/design"
import { ExplainIcon } from "@/components/mindmap/icons"
import type { MasteryLevel } from "@/lib/mindmap/types"

interface MasteryToolbarProps {
  current: MasteryLevel | undefined
  /** Mastery buttons render only for leaves; „Wyjaśnij” shows for every node. */
  showMastery: boolean
  onSelect: (level: MasteryLevel) => void
  onExplain: () => void
}

export default function MasteryToolbar({ current, showMastery, onSelect, onExplain }: MasteryToolbarProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-zinc-900/90 p-1 shadow-lg backdrop-blur">
      {showMastery &&
        MASTERY_OPTIONS.map(({ level, label }) => {
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

      {showMastery && <span className="mx-0.5 h-4 w-px bg-white/10" />}

      <button
        type="button"
        onClick={onExplain}
        className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
      >
        <ExplainIcon size={12} />
        Wyjaśnij
      </button>
    </div>
  )
}
