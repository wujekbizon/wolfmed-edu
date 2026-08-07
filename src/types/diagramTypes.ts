import type { DiagramRole, DIAGRAM_GROUP_ROLE } from '@/constants/diagramRoles'

export type DiagramNodeRole = DiagramRole | typeof DIAGRAM_GROUP_ROLE

export type DiagramRoleMap = Map<string, DiagramNodeRole>

/** Stamped on every element so a click can be traced back to the graph node —
 *  convertToExcalidrawElements mints its own ids, so the mermaid id is lost. */
export interface DiagramElementData {
  nodeId: string
  role?: DiagramNodeRole
}

/**
 * What is selected — deliberately without its screen position.
 *
 * The anchor moves on every animation frame of a camera move; keeping it in
 * React state meant setState -> render -> onChange -> setState until React
 * killed it. Identity changes rarely and lives in state; the position is
 * written straight to the toolbar element.
 */
export interface DiagramSelection {
  /** A subgraph selects as one Excalidraw group, so a click is often a group. */
  kind: 'node' | 'group'
  elementId: string
  label: string
  groupId: string | null
}

/** Viewport position of the selection's top edge, relative to the canvas box. */
export interface DiagramAnchor {
  x: number
  y: number
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
