import { Handle, Position, type NodeProps, type Node } from "@xyflow/react"
import { motion } from "framer-motion"
import { getDepthSize, MASTERY_COLORS, lightenColor } from "@/lib/mindmap/design"
import { getCategoryIcon, ExplainIcon } from "@/components/mindmap/icons"
import type { MindMapNodeData } from "@/lib/mindmap/treeToFlow"

type MindMapFlowNode = Node<MindMapNodeData>

function labelFontSize(depth: number): number {
  if (depth === 0) return 13
  if (depth === 1) return 12
  return 10.5
}

export default function MindMapNode({
  data,
  selected,
  sourcePosition,
  targetPosition,
}: NodeProps<MindMapFlowNode>) {
  const size = getDepthSize(data.depth)
  const showIcon = data.depth <= 1
  const Icon = getCategoryIcon(data.category)
  const mastery = data.masteryLevel
  const isTrueLeaf = data.isLeaf && !data.collapsed
  const base = isTrueLeaf && mastery ? MASTERY_COLORS[mastery] : data.color
  const iconSize = Math.round(size * 0.24)

  const gradient = `radial-gradient(circle at 34% 28%, ${lightenColor(base, 0.28)}, ${base})`
  const glow = selected
    ? `0 0 0 3px rgba(255,255,255,0.9), 0 0 24px ${base}aa`
    : `inset 0 1px 1px rgba(255,255,255,0.35), 0 4px 12px ${base}66, 0 0 16px ${base}40`

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: data.dimmed ? 0.4 : 1, scale: 1 }}
      whileHover={{ scale: 1.05, opacity: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="relative flex items-center justify-center overflow-visible rounded-full text-white"
      style={{
        width: size,
        height: size,
        background: gradient,
        boxShadow: glow,
        outline: data.collapsed ? `2px dashed ${lightenColor(base, 0.4)}` : undefined,
        outlineOffset: data.collapsed ? 3 : undefined,
      }}
    >
      <Handle
        type="target"
        position={targetPosition ?? Position.Top}
        className="h-1! w-1! border-0! bg-transparent! opacity-0!"
      />
      <Handle
        type="source"
        position={sourcePosition ?? Position.Bottom}
        className="h-1! w-1! border-0! bg-transparent! opacity-0!"
      />

      <div className="flex max-h-full flex-col items-center justify-center gap-0.5 px-1.5">
        {showIcon && <Icon size={iconSize} />}
        <span
          className="line-clamp-3 max-w-full break-words text-center font-semibold leading-tight [text-shadow:0_1px_2px_rgba(0,0,0,0.4)]"
          style={{ fontSize: labelFontSize(data.depth) }}
        >
          {data.label}
        </span>
      </div>

      {data.collapsed && data.hiddenCount > 0 && (
        <span className="absolute -bottom-1 -right-1 min-w-5 rounded-full bg-zinc-950 px-1 text-center text-[10px] font-semibold leading-5 text-white shadow ring-1 ring-white/20">
          +{data.hiddenCount}
        </span>
      )}

      {data.hasExplanation && (
        <span
          className="absolute -left-1 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-950 text-[#f58a8a] shadow ring-1 ring-white/20"
          title="Ma wyjaśnienie AI"
        >
          <ExplainIcon size={10} />
        </span>
      )}

      {isTrueLeaf && mastery && (
        <span
          className="absolute right-0.5 top-0.5 h-3 w-3 rounded-full border-2 border-zinc-900"
          style={{ background: MASTERY_COLORS[mastery] }}
        />
      )}
    </motion.div>
  )
}
