import { Handle, Position, type NodeProps, type Node } from "@xyflow/react"
import { getDepthSize, MASTERY_COLORS } from "@/lib/mindmap/design"
import { getCategoryIcon } from "@/components/mindmap/icons"
import type { MindMapNodeData } from "@/lib/mindmap/treeToFlow"

type MindMapFlowNode = Node<MindMapNodeData>

function labelFontSize(depth: number): number {
  if (depth === 0) return 13
  if (depth === 1) return 12
  if (depth === 2) return 11
  return 10
}

export default function MindMapNode({ data, selected }: NodeProps<MindMapFlowNode>) {
  const size = getDepthSize(data.depth)
  const showIcon = data.depth <= 1
  const Icon = getCategoryIcon(data.category)
  const mastery = data.masteryLevel
  const isTrueLeaf = data.isLeaf && !data.collapsed
  const background = isTrueLeaf && mastery ? MASTERY_COLORS[mastery] : data.color
  const iconSize = Math.round(size * 0.32)

  return (
    <div
      className={`relative flex items-center justify-center rounded-full text-white text-center shadow-md transition-shadow ${
        selected ? "ring-2 ring-white/80 ring-offset-2 ring-offset-transparent" : ""
      }`}
      style={{
        width: size,
        height: size,
        background,
        outline: data.collapsed ? "2px dashed rgba(255,255,255,0.75)" : undefined,
        outlineOffset: data.collapsed ? 3 : undefined,
      }}
    >
      <Handle type="target" position={Position.Top} className="!h-1 !w-1 !border-0 !bg-transparent !opacity-0" />
      <Handle type="source" position={Position.Bottom} className="!h-1 !w-1 !border-0 !bg-transparent !opacity-0" />

      <div className="flex flex-col items-center justify-center gap-0.5 px-1 leading-tight">
        {showIcon && <Icon size={iconSize} />}
        <span
          className="max-w-[92%] font-semibold [text-shadow:0_1px_2px_rgba(0,0,0,0.35)] line-clamp-2"
          style={{ fontSize: labelFontSize(data.depth) }}
        >
          {data.label}
        </span>
      </div>

      {data.collapsed && data.hiddenCount > 0 && (
        <span className="absolute -bottom-1 -right-1 min-w-5 rounded-full bg-zinc-800 px-1 text-center text-[10px] font-semibold leading-5 text-white shadow">
          +{data.hiddenCount}
        </span>
      )}

      {isTrueLeaf && mastery && (
        <span
          className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full border-2 border-white/80"
          style={{ background: MASTERY_COLORS[mastery] }}
        />
      )}
    </div>
  )
}
