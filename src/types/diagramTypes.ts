import type { DiagramRole, DIAGRAM_GROUP_ROLE } from '@/constants/diagramRoles'

export type DiagramNodeRole = DiagramRole | typeof DIAGRAM_GROUP_ROLE

export type DiagramRoleMap = Map<string, DiagramNodeRole>

/** Stamped on every element so a click can be traced back to the graph node —
 *  convertToExcalidrawElements mints its own ids, so the mermaid id is lost. */
export interface DiagramElementData {
  nodeId: string
  role?: DiagramNodeRole
}
