import type { ExcalidrawElementSkeleton } from '@excalidraw/excalidraw/data/transform'
import { GROUP_SEPARATION, GROUP_SEPARATION_PASSES } from '@/constants/diagramCanvas'
import { computeGroupBoxes, isPositioned, membersOf, overlapOf, type Positioned } from './groupBoxes'
import type { DiagramGroup } from '@/types/diagramTypes'

interface Shift {
  dx: number
  dy: number
}

type Bindable = { start?: { id?: string }; end?: { id?: string }; points?: number[][] }

/**
 * Pushes overlapping groups apart.
 *
 * Mermaid used to reserve space around a cluster; it no longer knows the groups
 * exist, so two independent chains get placed side by side with only the usual
 * node gap between them and their containers collide. Each overlapping pair is
 * separated along whichever axis needs the smaller push, which keeps the ranks
 * Mermaid chose rather than relaying the diagram out.
 */
export function separateGroups(
  skeleton: ExcalidrawElementSkeleton[],
  groups: DiagramGroup[]
): ExcalidrawElementSkeleton[] {
  if (groups.length < 2) return skeleton

  const shifts = new Map<string, Shift>()
  let moved = [...skeleton]

  for (let pass = 0; pass < GROUP_SEPARATION_PASSES; pass++) {
    const boxes = computeGroupBoxes(moved, groups)
    const collision = findCollision(groups, boxes)
    if (!collision) break

    const { group, shift } = collision
    for (const nodeId of membersOf(group, groups)) {
      const current = shifts.get(nodeId) ?? { dx: 0, dy: 0 }
      shifts.set(nodeId, { dx: current.dx + shift.dx, dy: current.dy + shift.dy })
    }
    moved = translate(moved, membersOf(group, groups), shift)
  }

  return shifts.size === 0 ? skeleton : reconnect(moved, shifts)
}

function findCollision(
  groups: DiagramGroup[],
  boxes: Map<string, ReturnType<typeof computeGroupBoxes> extends Map<string, infer B> ? B : never>
): { group: DiagramGroup; shift: Shift } | null {
  for (let i = 0; i < groups.length; i++) {
    for (let j = i + 1; j < groups.length; j++) {
      const a = groups[i]
      const b = groups[j]
      if (!a || !b) continue
      // A nested group is meant to sit inside its parent.
      if (a.ancestors.includes(b.id) || b.ancestors.includes(a.id)) continue

      const boxA = boxes.get(a.id)
      const boxB = boxes.get(b.id)
      if (!boxA || !boxB) continue

      const overlap = overlapOf(boxA, boxB)
      if (overlap.x <= 0 || overlap.y <= 0) continue

      // Push along the axis that needs the least movement.
      if (overlap.x <= overlap.y) {
        const push = overlap.x + GROUP_SEPARATION
        const rightmost = boxA.minX <= boxB.minX ? b : a
        return { group: rightmost, shift: { dx: push, dy: 0 } }
      }

      const push = overlap.y + GROUP_SEPARATION
      const lowest = boxA.minY <= boxB.minY ? b : a
      return { group: lowest, shift: { dx: 0, dy: push } }
    }
  }

  return null
}

function translate(
  skeleton: ExcalidrawElementSkeleton[],
  nodeIds: string[],
  shift: Shift
): ExcalidrawElementSkeleton[] {
  const ids = new Set(nodeIds)

  return skeleton.map((element) => {
    if (!isPositioned(element) || !ids.has(String(element.id))) return element
    return { ...element, x: element.x + shift.dx, y: element.y + shift.dy }
  })
}

/**
 * Rebuilds the arrows the move invalidated.
 *
 * An arrow whose ends moved together keeps its shape and travels with them. One
 * that now spans a new gap is redrawn between the two centres — a binding alone
 * does not route an arrow, it only produces a stub.
 */
function reconnect(
  skeleton: ExcalidrawElementSkeleton[],
  shifts: Map<string, Shift>
): ExcalidrawElementSkeleton[] {
  const byId = new Map(skeleton.filter(isPositioned).map((el) => [String(el.id), el]))
  const centre = (element: Positioned) => ({
    x: element.x + element.width / 2,
    y: element.y + element.height / 2,
  })

  return skeleton.map((element) => {
    if (element.type !== 'arrow') return element

    const { start, end } = element as ExcalidrawElementSkeleton & Bindable
    const from = start?.id ? byId.get(start.id) : undefined
    const to = end?.id ? byId.get(end.id) : undefined
    if (!from || !to || !start?.id || !end?.id) return element

    const shiftFrom = shifts.get(start.id) ?? { dx: 0, dy: 0 }
    const shiftTo = shifts.get(end.id) ?? { dx: 0, dy: 0 }
    if (shiftFrom.dx === 0 && shiftFrom.dy === 0 && shiftTo.dx === 0 && shiftTo.dy === 0) {
      return element
    }

    if (shiftFrom.dx === shiftTo.dx && shiftFrom.dy === shiftTo.dy) {
      const positioned = element as ExcalidrawElementSkeleton & { x?: number; y?: number }
      if (typeof positioned.x !== 'number' || typeof positioned.y !== 'number') return element
      return { ...element, x: positioned.x + shiftFrom.dx, y: positioned.y + shiftFrom.dy }
    }

    const head = centre(from)
    const tail = centre(to)
    return {
      ...element,
      x: head.x,
      y: head.y,
      points: [
        [0, 0],
        [tail.x - head.x, tail.y - head.y],
      ],
    } as ExcalidrawElementSkeleton
  })
}
