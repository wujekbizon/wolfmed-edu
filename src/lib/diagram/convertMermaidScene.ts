import { convertToExcalidrawElements } from '@excalidraw/excalidraw'
import { parseMermaidToExcalidraw } from '@excalidraw/mermaid-to-excalidraw'
import { parseDiagramRoles } from '@/helpers/parseDiagramRoles'
import { repairMermaidSubgraphs } from '@/helpers/repairMermaidSubgraphs'
import { buildDiagramLegend } from './buildDiagramLegend'
import { buildGroupContainers } from './buildGroupContainers'
import { extractSubgraphs } from './extractSubgraphs'
import { separateGroups } from './separateGroups'
import { styleDiagramSkeleton } from './styleDiagramSkeleton'
import type { ExcalidrawScene } from '@/types/diagramTypes'

/**
 * Mermaid source to a styled scene. The styling pass runs on the skeleton —
 * see styleDiagramSkeleton for why that ordering is not optional.
 *
 * The repair also runs here, not only at generation: cells written before it
 * existed still hold the source that fails to convert, and this is where they
 * get another chance at it.
 *
 * Groups are lifted out before conversion and drawn afterwards — see
 * extractSubgraphs for why the converter is not shown them.
 */
export async function convertMermaidScene(source: string): Promise<ExcalidrawScene> {
  const mermaid = repairMermaidSubgraphs(source)
  const { source: ungrouped, groups } = extractSubgraphs(mermaid)

  const { elements: raw, files } = await parseMermaidToExcalidraw(ungrouped)
  const roles = parseDiagramRoles(mermaid)
  const skeleton = separateGroups(raw, groups)
  const { containers, groupIdsById } = buildGroupContainers(skeleton, groups)

  const grouped = skeleton.map((element) => {
    const groupIds = groupIdsById.get(String(element.id))
    return groupIds ? { ...element, groupIds } : element
  })

  // Containers go through the styling pass too: it is what marks them with the
  // group role that selection and the dashed treatment both read.
  const elements = convertToExcalidrawElements([
    ...styleDiagramSkeleton(containers, roles),
    ...styleDiagramSkeleton(grouped, roles),
    ...buildDiagramLegend(skeleton, roles),
  ])

  return {
    elements,
    appState: { collaborators: [] },
    ...(files ? { files } : {}),
  }
}
