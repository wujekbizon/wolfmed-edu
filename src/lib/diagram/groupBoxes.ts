import type { ExcalidrawElementSkeleton } from '@excalidraw/excalidraw/data/transform'
import { GROUP_PADDING, GROUP_TITLE_SPACE } from '@/constants/diagramCanvas'
import type { DiagramGroup } from '@/types/diagramTypes'

export type Positioned = ExcalidrawElementSkeleton & {
  x: number
  y: number
  width: number
  height: number
}

export interface Box {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

export const isPositioned = (element: ExcalidrawElementSkeleton): element is Positioned =>
  'x' in element && typeof element.x === 'number' && typeof (element as Positioned).width === 'number'

/** Every node in a group, including those held by groups nested inside it. */
export function membersOf(group: DiagramGroup, groups: DiagramGroup[]): string[] {
  const nested = groups
    .filter((candidate) => candidate.ancestors.includes(group.id))
    .flatMap((candidate) => candidate.nodeIds)

  return [...new Set([...group.nodeIds, ...nested])]
}

/**
 * The box each group's container will occupy.
 *
 * Resolved inside out: a parent is measured against its children's finished
 * boxes, not their raw members, or a padded child grows straight through the
 * parent that is supposed to contain it.
 */
export function computeGroupBoxes(
  skeleton: ExcalidrawElementSkeleton[],
  groups: DiagramGroup[]
): Map<string, Box> {
  const byId = new Map(skeleton.filter(isPositioned).map((element) => [String(element.id), element]))
  const boxes = new Map<string, Box>()

  for (const group of [...groups].sort((a, b) => b.ancestors.length - a.ancestors.length)) {
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

  return boxes
}

export function overlapOf(a: Box, b: Box): { x: number; y: number } {
  return {
    x: Math.min(a.maxX, b.maxX) - Math.max(a.minX, b.minX),
    y: Math.min(a.maxY, b.maxY) - Math.max(a.minY, b.minY),
  }
}
