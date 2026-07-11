import { toPng } from "html-to-image"
import { getNodesBounds, getViewportForBounds, type Node } from "@xyflow/react"
import type { MindMapNodeData } from "./treeToFlow"

const CANVAS_BG = "#18181b"
const EXPORT_WIDTH = 1200
const EXPORT_HEIGHT = 800

/**
 * Render the current React Flow viewport to a downloadable PNG framed around all
 * nodes. No-op when the viewport element is missing or the map is empty.
 */
export function exportMindMapPng(
  viewportEl: HTMLElement | null | undefined,
  nodes: Node<MindMapNodeData>[]
): void {
  if (!viewportEl || nodes.length === 0) return

  const bounds = getNodesBounds(nodes)
  const vp = getViewportForBounds(bounds, EXPORT_WIDTH, EXPORT_HEIGHT, 0.5, 2, 0.12)

  toPng(viewportEl, {
    backgroundColor: CANVAS_BG,
    width: EXPORT_WIDTH,
    height: EXPORT_HEIGHT,
    style: {
      width: `${EXPORT_WIDTH}px`,
      height: `${EXPORT_HEIGHT}px`,
      transform: `translate(${vp.x}px, ${vp.y}px) scale(${vp.zoom})`,
    },
  })
    .then((dataUrl) => {
      const link = document.createElement("a")
      link.download = "mapa-mysli.png"
      link.href = dataUrl
      link.click()
    })
    .catch(() => {})
}
