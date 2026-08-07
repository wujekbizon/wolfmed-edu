import type { DiagramRole, DIAGRAM_GROUP_ROLE } from '@/constants/diagramRoles'

export type DiagramNodeRole = DiagramRole | typeof DIAGRAM_GROUP_ROLE

export type DiagramRoleMap = Map<string, DiagramNodeRole>

export interface DiagramSelection {
  /** A subgraph selects as one Excalidraw group, so a click is often a group. */
  kind: 'node' | 'group'
  elementId: string
  label: string
  groupId: string | null
}

/**
 * A subgraph, lifted out of the Mermaid source so the container can be drawn
 * from its members rather than by the converter.
 */
export interface DiagramGroup {
  id: string
  title: string
  nodeIds: string[]
  /** Enclosing groups, innermost first. */
  ancestors: string[]
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
