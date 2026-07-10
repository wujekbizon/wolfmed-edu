import { MASTERY_COLORS } from "@/lib/mindmap/design"
import type { MasteryLevel } from "@/lib/mindmap/types"

const OPTIONS: { level: MasteryLevel; label: string }[] = [
  { level: "unseen", label: "Nie znam" },
  { level: "learning", label: "Uczę się" },
  { level: "mastered", label: "Umiem" },
]

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
        OPTIONS.map(({ level, label }) => {
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
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.4 1 2.3h6c0-.9.4-1.8 1-2.3A7 7 0 0 0 12 2z" />
          <path d="M9.5 20h5" />
          <path d="M10.5 22h3" />
        </svg>
        Wyjaśnij
      </button>
    </div>
  )
}
