import type { ExcalidrawElementSkeleton } from '@excalidraw/excalidraw/data/transform'
import { DIAGRAM_GROUP_ROLE, DIAGRAM_ROLE_COLORS } from '@/constants/diagramRoles'
import { GROUP_PADDING, GROUP_TITLE_SPACE } from '@/constants/diagramCanvas'
import type { DiagramGroup } from '@/types/diagramTypes'

type Positioned = ExcalidrawElementSkeleton & { x: number; y: number; width: number; height: number }

interface Box {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

const isPositioned = (element: ExcalidrawElementSkeleton): element is Positioned =>
  'x' in element && typeof element.x === 'number' && typeof (element as Positioned).width === 'number'

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
  const byId = new Map(skeleton.filter(isPositioned).map((element) => [String(element.id), element]))
  const boxes = new Map<string, Box>()
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

  const deepestFirst = [...groups].sort((a, b) => b.ancestors.length - a.ancestors.length)

  for (const group of deepestFirst) {
    const own = group.nodeIds.map((id) => byId.get(id)).filter((el): el is Positioned => Boolean(el))
    const children = groups
      .filter((candidate) => candidate.ancestors[0] === group.id)
      .map((child) => boxes.get(child.id))
      .filter((box): box is Box => Boolean(box))

    if (own.length === 0 && children.length === 0) continue

    const corners: Box[] = [
      ...own.map((el) => ({ minX: el.x, minY: el.y, maxX: el.x + el.width, maxY: el.y + el.height })),
      ...children,
    ]

    boxes.set(group.id, {
      minX: Math.min(...corners.map((c) => c.minX)) - GROUP_PADDING,
      minY: Math.min(...corners.map((c) => c.minY)) - GROUP_PADDING - GROUP_TITLE_SPACE,
      maxX: Math.max(...corners.map((c) => c.maxX)) + GROUP_PADDING,
      maxY: Math.max(...corners.map((c) => c.maxY)) + GROUP_PADDING,
    })
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

function membersOf(group: DiagramGroup, groups: DiagramGroup[]): string[] {
  const nested = groups
    .filter((candidate) => candidate.ancestors.includes(group.id))
    .flatMap((candidate) => candidate.nodeIds)

  return [...new Set([...group.nodeIds, ...nested])]
}
