import { Handle, Position, type NodeProps, type Node } from "@xyflow/react"
import { getDepthSize, MASTERY_COLORS, lightenColor } from "@/lib/mindmap/design"
import { getCategoryIcon } from "@/components/mindmap/icons"
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
    <div
      className="relative flex items-center justify-center overflow-visible rounded-full text-white transition-transform duration-150 hover:scale-105"
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

      {isTrueLeaf && mastery && (
        <span
          className="absolute right-0.5 top-0.5 h-3 w-3 rounded-full border-2 border-zinc-900"
          style={{ background: MASTERY_COLORS[mastery] }}
        />
      )}
    </div>
  )
}
