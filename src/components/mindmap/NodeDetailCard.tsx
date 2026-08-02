import { motion } from "framer-motion"
import { getCategoryColor } from "@/lib/mindmap/design"
import { ChevronRight } from "lucide-react"
import { getCategoryIcon, CloseIcon, ExplainIcon } from "@/components/mindmap/icons"
import NodeMasteryPicker from "./NodeMasteryPicker"
import type { MasteryLevel, MindMapNode } from "@/types/mindmapTypes"

interface NodeDetailCardProps {
  node: MindMapNode
  path: string[]
  onClose: () => void
  onSetMastery: (level: MasteryLevel) => void
  onExplain: () => void
  onOpenExplanation: () => void
}

export default function NodeDetailCard({
  node,
  path,
  onClose,
  onSetMastery,
  onExplain,
  onOpenExplanation,
}: NodeDetailCardProps) {
  const category = node.metadata?.category
  const color = getCategoryColor(category)
  const Icon = getCategoryIcon(category)
  const notes = node.metadata?.notes?.trim()
  const explanation = node.metadata?.explanation?.trim()
  const isLeaf = node.children.length === 0
  const breadcrumb = path.slice(0, -1)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="absolute inset-x-0 bottom-3 z-10 flex max-h-[70%] flex-col rounded-t-2xl border border-white/10 bg-zinc-900/95 p-4 shadow-2xl backdrop-blur md:inset-x-auto md:inset-y-3 md:right-3 md:max-h-none md:w-80 md:rounded-2xl">
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
          <CloseIcon />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin scrollbar-webkit">
        <p className="text-sm leading-relaxed text-zinc-300">
          {notes || "Brak krótkiego opisu. Kliknij „Wyjaśnij”, aby uzyskać pełne wyjaśnienie od asystenta AI."}
        </p>
      </div>

      {explanation && (
        <button
          type="button"
          onClick={onOpenExplanation}
          className="mt-3 flex shrink-0 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left text-zinc-300 transition-colors hover:bg-white/10 hover:text-zinc-100"
        >
          <ExplainIcon size={14} />
          <span className="flex-1 text-[11px] font-semibold uppercase tracking-wide">
            Wyjaśnienie AI
          </span>
          <ChevronRight size={14} className="shrink-0" />
        </button>
      )}

      {isLeaf && <NodeMasteryPicker current={node.metadata?.masteryLevel} onSelect={onSetMastery} />}

      <button
        type="button"
        onClick={onExplain}
        className="mt-3 flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#f58a8a] px-4 py-2.5 text-sm font-semibold text-zinc-900 transition-colors hover:bg-[#ff9898]"
      >
        <ExplainIcon />
        {explanation ? "Wyjaśnij ponownie (AI)" : "Wyjaśnij szerzej (AI)"}
      </button>
    </motion.div>
  )
}
