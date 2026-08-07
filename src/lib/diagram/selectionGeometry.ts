import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types'
import type { DiagramSelection } from '@/types/diagramTypes'


type Elements = readonly ExcalidrawElement[]

/**
 * Guards the selection state against re-render loops.
 *
 * onChange fires when the host re-renders as well as when the scene changes,
 * so storing a freshly built object every time meant setState -> render ->
 * onChange -> setState, which React kills with "maximum update depth
 * exceeded". Position is excluded on purpose: it changes on every frame of a
 * camera animation and is applied to the toolbar directly.
 */
export function isSameSelection(a: DiagramSelection | null, b: DiagramSelection | null): boolean {
  if (a === b) return true
  if (!a || !b) return false

  return a.kind === b.kind && a.elementId === b.elementId && a.groupId === b.groupId
}

/**
 * The group every selected element belongs to, innermost first.
 *
 * Nested subgraphs give a member several group ids ordered inside-out, so the
 * first shared one is the tightest group that covers the whole selection.
 */
export function getCommonGroupId(selected: Elements): string | null {
  const first = selected[0]
  if (!first?.groupIds?.length) return null

  return (
    first.groupIds.find((groupId) =>
      selected.every((element) => element.groupIds?.includes(groupId))
    ) ?? null
  )
}


