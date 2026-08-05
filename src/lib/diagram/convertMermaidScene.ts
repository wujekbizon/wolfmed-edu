import { convertToExcalidrawElements } from '@excalidraw/excalidraw'
import { parseMermaidToExcalidraw } from '@excalidraw/mermaid-to-excalidraw'
import { parseDiagramRoles } from '@/helpers/parseDiagramRoles'
import { buildDiagramLegend } from './buildDiagramLegend'
import { styleDiagramSkeleton } from './styleDiagramSkeleton'
import type { ExcalidrawScene } from '@/types/diagramTypes'

/**
 * Mermaid source to a styled scene. The styling pass runs on the skeleton —
 * see styleDiagramSkeleton for why that ordering is not optional.
 */
export async function convertMermaidScene(mermaid: string): Promise<ExcalidrawScene> {
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
