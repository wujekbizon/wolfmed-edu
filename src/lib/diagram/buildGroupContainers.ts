import type { ExcalidrawElementSkeleton } from '@excalidraw/excalidraw/data/transform'
import { DIAGRAM_GROUP_ROLE, DIAGRAM_ROLE_COLORS } from '@/constants/diagramRoles'
import { computeGroupBoxes, membersOf } from './groupBoxes'
import type { DiagramGroup } from '@/types/diagramTypes'

/**
 * Draws a container behind each group and marks its members.
 *
 * Mermaid is never told about the subgraphs (see extractSubgraphs), so each box
 * is derived from where its contents actually landed. Nesting is resolved from
 * the inside out: a parent's box is measured against its children's finished
 * boxes, not their raw members, or a padded child grows straight through the
 * parent that is supposed to contain it.
 *
 * Containers are returned outermost first so they paint behind their children,
 * and a group whose members never reached the canvas produces nothing.
 */
export function buildGroupContainers(
  skeleton: ExcalidrawElementSkeleton[],
  groups: DiagramGroup[]
): { containers: ExcalidrawElementSkeleton[]; groupIdsById: Map<string, string[]> } {
  const boxes = computeGroupBoxes(skeleton, groups)
  const groupIdsById = new Map<string, string[]>()
  const depthById = new Map(groups.map((group) => [group.id, group.ancestors.length]))

  for (const group of groups) {
    for (const nodeId of membersOf(group, groups)) {
      const chain = groupIdsById.get(nodeId) ?? []
      chain.push(group.id)
      groupIdsById.set(nodeId, chain)
    }
  }

  // Innermost first, which is the order getCommonGroupId reads to find the
  // tightest group around a selection. Sorting by depth keeps that independent
  // of the order the groups happened to be declared in.
  for (const chain of groupIdsById.values()) {
    chain.sort((a, b) => (depthById.get(b) ?? 0) - (depthById.get(a) ?? 0))
  }

  const style = DIAGRAM_ROLE_COLORS[DIAGRAM_GROUP_ROLE]
  const containers = [...groups]
    .sort((a, b) => a.ancestors.length - b.ancestors.length)
    .flatMap((group) => {
      const box = boxes.get(group.id)
      if (!box) return []

      return [
        {
          type: 'rectangle',
          id: group.id,
          x: box.minX,
          y: box.minY,
          width: box.maxX - box.minX,
          height: box.maxY - box.minY,
          backgroundColor: style.fill,
          strokeColor: style.stroke,
          fillStyle: 'solid',
          groupIds: [group.id, ...group.ancestors],
          label: { text: group.title, strokeColor: style.text, verticalAlign: 'top' },
        } as ExcalidrawElementSkeleton,
      ]
    })

  return { containers, groupIdsById }
}
