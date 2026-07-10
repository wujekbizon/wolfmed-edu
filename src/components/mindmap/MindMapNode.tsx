import { Handle, Position, type NodeProps, type Node } from "@xyflow/react"
import { getDepthSize, MASTERY_COLORS, lightenColor } from "@/lib/mindmap/design"
import { getCategoryIcon } from "@/components/mindmap/icons"
import type { MindMapNodeData } from "@/lib/mindmap/treeToFlow"

type MindMapFlowNode = Node<MindMapNodeData>

export default function MindMapNode({ data, selected }: NodeProps<MindMapFlowNode>) {
  const size = getDepthSize(data.depth)
  const showIcon = data.depth <= 1
  const Icon = getCategoryIcon(data.category)
  const mastery = data.masteryLevel
  const isTrueLeaf = data.isLeaf && !data.collapsed
  const base = isTrueLeaf && mastery ? MASTERY_COLORS[mastery] : data.color
  const iconSize = Math.round(size * 0.34)

  const gradient = `radial-gradient(circle at 34% 28%, ${lightenColor(base, 0.28)}, ${base})`
  const glow = selected
    ? `0 0 0 3px rgba(255,255,255,0.9), 0 0 24px ${base}aa`
    : `inset 0 1px 1px rgba(255,255,255,0.35), 0 4px 12px ${base}66, 0 0 16px ${base}40`

  return (
    <div
      className="relative flex items-center justify-center rounded-full text-white transition-transform duration-150 hover:scale-105"
      style={{
        width: size,
        height: size,
        background: gradient,
        boxShadow: glow,
        outline: data.collapsed ? `2px dashed ${lightenColor(base, 0.4)}` : undefined,
        outlineOffset: data.collapsed ? 3 : undefined,
      }}
    >
      <Handle type="target" position={Position.Top} className="!h-1 !w-1 !border-0 !bg-transparent !opacity-0" />
      <Handle type="source" position={Position.Bottom} className="!h-1 !w-1 !border-0 !bg-transparent !opacity-0" />

      {showIcon && <Icon size={iconSize} />}

      {data.collapsed && data.hiddenCount > 0 && (
        <span className="absolute -bottom-1 -right-1 min-w-5 rounded-full bg-zinc-950 px-1 text-center text-[10px] font-semibold leading-5 text-white shadow ring-1 ring-white/20">
          +{data.hiddenCount}
        </span>
      )}

      {isTrueLeaf && mastery && (
        <span
          className="absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-zinc-900"
          style={{ background: MASTERY_COLORS[mastery] }}
        />
      )}

      <span className="pointer-events-none absolute left-1/2 top-full mt-1.5 w-max max-w-[104px] -translate-x-1/2 rounded-md bg-zinc-900/80 px-1.5 py-0.5 text-center text-[11px] font-medium leading-tight text-zinc-100 line-clamp-2 ring-1 ring-white/5 backdrop-blur-sm">
        {data.label}
      </span>
    </div>
  )
}
