import { getCategoryColor, MASTERY_COLORS } from "@/lib/mindmap/design"
import { getCategoryIcon } from "@/components/mindmap/icons"
import type { MasteryLevel, MindMapNode } from "@/lib/mindmap/types"

const MASTERY_OPTIONS: { level: MasteryLevel; label: string }[] = [
  { level: "unseen", label: "Nie znam" },
  { level: "learning", label: "Uczę się" },
  { level: "mastered", label: "Umiem" },
]

interface NodeDetailCardProps {
  node: MindMapNode
  path: string[]
  onClose: () => void
  onSetMastery: (level: MasteryLevel) => void
  onExplain: () => void
}

export default function NodeDetailCard({ node, path, onClose, onSetMastery, onExplain }: NodeDetailCardProps) {
  const category = node.metadata?.category
  const color = getCategoryColor(category)
  const Icon = getCategoryIcon(category)
  const notes = node.metadata?.notes?.trim()
  const mastery = node.metadata?.masteryLevel
  const isLeaf = node.children.length === 0
  const breadcrumb = path.slice(0, -1)

  return (
    <div className="absolute inset-x-0 bottom-0 z-10 flex max-h-[72%] flex-col rounded-t-2xl border border-white/10 bg-zinc-900/95 p-4 shadow-2xl backdrop-blur md:inset-y-0 md:left-auto md:right-0 md:max-h-none md:w-80 md:rounded-none md:rounded-l-2xl md:border-y-0 md:border-r-0">
      <div className="mb-3 flex items-start gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
          style={{ background: color }}
        >
          <Icon size={20} />
        </span>
        <div className="min-w-0 flex-1">
          {breadcrumb.length > 0 && (
            <p className="truncate text-[11px] text-zinc-500">{breadcrumb.join(" › ")}</p>
          )}
          <h3 className="text-base font-semibold leading-tight text-zinc-100">{node.label}</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Zamknij"
          className="shrink-0 rounded-md p-1 text-zinc-500 transition-colors hover:bg-white/10 hover:text-zinc-200"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <p className="text-sm leading-relaxed text-zinc-300">
          {notes || "Brak krótkiego opisu. Kliknij „Wyjaśnij”, aby uzyskać pełne wyjaśnienie od asystenta AI."}
        </p>
      </div>

      {isLeaf && (
        <div className="mt-3">
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-500">Twój poziom</p>
          <div className="flex gap-1.5">
            {MASTERY_OPTIONS.map(({ level, label }) => {
              const active = mastery === level
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => onSetMastery(level)}
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
      )}

      <button
        type="button"
        onClick={onExplain}
        className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-[#f58a8a] px-4 py-2.5 text-sm font-semibold text-zinc-900 transition-colors hover:bg-[#ff9898]"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.4 1 2.3h6c0-.9.4-1.8 1-2.3A7 7 0 0 0 12 2z" />
          <path d="M9.5 20h5" />
          <path d="M10.5 22h3" />
        </svg>
        Wyjaśnij szerzej (AI)
      </button>
    </div>
  )
}
