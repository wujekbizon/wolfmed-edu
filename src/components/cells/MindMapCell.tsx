"use client"

import ResizableComponent from "../Resizable"
import MindMapView from "@/components/mindmap/MindMapView"
import MindMapGenerateForm from "./MindMapGenerateForm"
import { useCellsStore } from "@/store/useCellsStore"
import type { Cell } from "@/types/cellTypes"
import type { MindMapCellContent, MindMapNode } from "@/lib/mindmap/types"

function parseContent(raw: string): MindMapCellContent | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as MindMapCellContent
    return parsed?.root ? parsed : null
  } catch {
    return null
  }
}

export default function MindMapCell({ cell }: { cell: Cell }) {
  const updateCell = useCellsStore((s) => s.updateCell)
  const content = parseContent(cell.content)

  const handleRootChange = (root: MindMapNode) => {
    if (!content) return
    updateCell(cell.id, JSON.stringify({ ...content, root }))
  }

  return (
    <ResizableComponent direction="vertical">
      {content ? (
        <div className="h-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
          <MindMapView root={content.root} onRootChange={handleRootChange} />
        </div>
      ) : (
        <div className="flex h-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <MindMapGenerateForm cell={cell} />
        </div>
      )}
    </ResizableComponent>
  )
}
