import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types'

type Elements = readonly ExcalidrawElement[]

type Bindable = {
  startBinding?: { elementId: string } | null
  endBinding?: { elementId: string } | null
}

/**
 * A node plus whatever it points at and whatever points at it.
 *
 * Focusing a single node fills the viewport with one box and tells the student
 * nothing; the answer to "what is this" is the arrows around it.
 */
export function getNeighbourhood(elements: Elements, elementId: string): ExcalidrawElement[] {
  if (!elements.some((element) => element.id === elementId)) return []

  const ids = new Set<string>([elementId])

  for (const element of elements) {
    if (element.type !== 'arrow') continue

    const { startBinding, endBinding } = element as unknown as Bindable
    const start = startBinding?.elementId
    const end = endBinding?.elementId

    if (start === elementId && end) {
      ids.add(end)
      ids.add(element.id)
    }
    if (end === elementId && start) {
      ids.add(start)
      ids.add(element.id)
    }
  }

  return elements.filter((element) => ids.has(element.id))
}

/** Every element inside a subgraph, container included. */
export function getGroupElements(elements: Elements, groupId: string): ExcalidrawElement[] {
  return elements.filter((element) => element.groupIds?.includes(groupId))
}

/** The subgraph an element belongs to — the innermost one when nested. */
export function getOwnGroupId(element: ExcalidrawElement | undefined): string | null {
  return element?.groupIds?.[0] ?? null
}
