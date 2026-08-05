import { convertToExcalidrawElements } from '@excalidraw/excalidraw'
import { parseMermaidToExcalidraw } from '@excalidraw/mermaid-to-excalidraw'
import { parseDiagramRoles } from '@/helpers/parseDiagramRoles'
import { repairMermaidSubgraphs } from '@/helpers/repairMermaidSubgraphs'
import { buildDiagramLegend } from './buildDiagramLegend'
import { styleDiagramSkeleton } from './styleDiagramSkeleton'
import type { ExcalidrawScene } from '@/types/diagramTypes'

/**
 * Mermaid source to a styled scene. The styling pass runs on the skeleton —
 * see styleDiagramSkeleton for why that ordering is not optional.
 *
 * The repair also runs here, not only at generation: cells written before it
 * existed still hold the source that fails to convert, and this is where they
 * get another chance at it.
 */
export async function convertMermaidScene(source: string): Promise<ExcalidrawScene> {
  const mermaid = repairMermaidSubgraphs(source)
  const { elements: skeleton, files } = await parseMermaidToExcalidraw(mermaid)
  const roles = parseDiagramRoles(mermaid)

  const elements = convertToExcalidrawElements([
    ...styleDiagramSkeleton(skeleton, roles),
    ...buildDiagramLegend(skeleton, roles),
  ])

  return {
    elements,
    appState: { collaborators: [] },
    ...(files ? { files } : {}),
  }
}
