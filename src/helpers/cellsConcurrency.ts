import type { Cell } from "@/types/cellTypes"

export interface CellsSnapshot {
  order: string[]
  cells: Record<string, Cell>
  version: number
}

export function boardsEqual(
  left: Pick<CellsSnapshot, "order" | "cells">,
  right: Pick<CellsSnapshot, "order" | "cells">
): boolean {
  if (left.order.length !== right.order.length) return false
  if (left.order.some((id, index) => id !== right.order[index])) return false

  const leftKeys = Object.keys(left.cells).sort()
  const rightKeys = Object.keys(right.cells).sort()
  if (leftKeys.length !== rightKeys.length) return false
  if (leftKeys.some((id, index) => id !== rightKeys[index])) return false

  return leftKeys.every((id) => {
    const leftCell = left.cells[id]
    const rightCell = right.cells[id]
    return (
      leftCell?.id === rightCell?.id &&
      leftCell?.type === rightCell?.type &&
      leftCell?.content === rightCell?.content
    )
  })
}

export type CellsHydrationDecision =
  | { type: "keep-local"; version: number | null; dirty: boolean }
  | { type: "use-server" }
  | { type: "conflict" }

export function decideCellsHydration(input: {
  local: Pick<CellsSnapshot, "order" | "cells">
  localVersion: number | null
  localDirty: boolean
  server: CellsSnapshot | null
}): CellsHydrationDecision {
  const { local, localVersion, localDirty, server } = input
  const localIsEmpty = local.order.length === 0 && Object.keys(local.cells).length === 0

  if (!server) {
    return { type: "keep-local", version: null, dirty: !localIsEmpty || localDirty }
  }

  if (boardsEqual(local, server)) {
    return { type: "keep-local", version: server.version, dirty: false }
  }

  if (localIsEmpty && !localDirty) return { type: "use-server" }

  if (localVersion === server.version) {
    return { type: "keep-local", version: localVersion, dirty: true }
  }

  return { type: "conflict" }
}
