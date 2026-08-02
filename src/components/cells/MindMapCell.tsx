"use client"

import { useCallback } from "react"
import ResizableComponent from "../Resizable"
import MindMapView from "@/components/mindmap/MindMapView"
import MindMapGenerateForm from "./MindMapGenerateForm"
import { useCellsStore } from "@/store/useCellsStore"
import { useRagStore } from "@/store/useRagStore"
import { getNodePath } from "@/lib/mindmap/treeOps"
import { parseMindMapCellContent } from "@/helpers/parseMindMapCellContent"
import { buildRagCellContent } from "@/helpers/buildRagCellContent"
import type { Cell } from "@/types/cellTypes"
import type { MindMapNode } from "@/types/mindmapTypes"

export default function MindMapCell({ cell }: { cell: Cell }) {
  const updateCell = useCellsStore((s) => s.updateCell)
  const insertCellAfterWithContent = useCellsStore((s) => s.insertCellAfterWithContent)
  const setPendingAutoSubmitCellId = useRagStore((s) => s.setPendingAutoSubmitCellId)
  const content = parseMindMapCellContent(cell.content)

  const handleRootChange = (root: MindMapNode) => {
    if (!content) return
    updateCell(cell.id, JSON.stringify({ ...content, root }))
  }

  // „Wyjaśnij” spawns an AI Asystent cell right below the map, pre-filled with a
  // breadcrumb-context query, and auto-submits it (same mechanism the learning
  // hub uses via pendingAutoSubmitCellId). The origin travels with the cell so the
  // answer can be written back onto the node that asked for it.
  const handleExplain = useCallback(
    (nodeId: string) => {
      if (!content) return
      const path = getNodePath(content.root, nodeId)
      if (!path) return
      const query =
        path.length > 1
          ? `Wyjaśnij zagadnienie „${path[path.length - 1]}” w kontekście: ${path.join(" → ")}. Wytłumacz przystępnie i zwięźle.`
          : `Wyjaśnij temat „${path[0]}” przystępnie i zwięźle.`

      const newCellId = insertCellAfterWithContent(
        cell.id,
        "rag",
        buildRagCellContent(query, { mapCellId: cell.id, nodeId })
      )
      setPendingAutoSubmitCellId(newCellId)

      // The rag cell mounts dynamically; give it a beat before scrolling to it.
      setTimeout(() => {
        document.getElementById(`cell-${newCellId}`)?.scrollIntoView({ behavior: "smooth", block: "center" })
      }, 250)
    },
    [content, cell.id, insertCellAfterWithContent, setPendingAutoSubmitCellId]
  )

  return (
    <ResizableComponent direction="vertical">
      {content ? (
        <div className="h-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
          <MindMapView root={content.root} onRootChange={handleRootChange} onExplain={handleExplain} />
        </div>
      ) : (
        <div className="flex h-full flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
          <MindMapGenerateForm cell={cell} />
        </div>
      )}
    </ResizableComponent>
  )
}
