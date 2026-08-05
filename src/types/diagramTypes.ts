import type { DiagramRole, DIAGRAM_GROUP_ROLE } from '@/constants/diagramRoles'

export type DiagramNodeRole = DiagramRole | typeof DIAGRAM_GROUP_ROLE

export type DiagramRoleMap = Map<string, DiagramNodeRole>

/** Stamped on every element so a click can be traced back to the graph node —
 *  convertToExcalidrawElements mints its own ids, so the mermaid id is lost. */
export interface DiagramElementData {
  nodeId: string
  role?: DiagramNodeRole
}

export interface ExcalidrawScene {
  elements: unknown[]
  appState?: Record<string, unknown>
  files?: Record<string, unknown> | null
}

/**
 * What a draw cell stores.
 *
 * The Mermaid source is kept alongside the scene rather than replaced by it.
 * Overwriting it meant a diagram could never be restyled, re-themed or rebuilt
 * after its first render — the scene was all that survived, and a scene carries
 * no graph.
 */
export interface DiagramCellContent {
  format: 'mermaid'
  source: string
  scene: ExcalidrawScene
}
