import { DIAGRAM_GROUP_ROLE, DIAGRAM_ROLES } from '@/constants/diagramRoles'
import { MERMAID_ID, MERMAID_ID_LIST } from '@/constants/mermaidSyntax'
import type { DiagramNodeRole, DiagramRoleMap } from '@/types/diagramTypes'

const CLASS_ASSIGNMENT = new RegExp(
  String.raw`^\s*class\s+(${MERMAID_ID_LIST}+?)\s+(${MERMAID_ID})\s*;?\s*$`,
  'u'
)
const INLINE_ROLE = new RegExp(
  String.raw`(?:^|[\s>|-])(${MERMAID_ID})(?:\[|\(|\{)[^\n]*?:::(${MERMAID_ID})`,
  'gu'
)

const isRole = (value: string): value is DiagramNodeRole =>
  value === DIAGRAM_GROUP_ROLE || (DIAGRAM_ROLES as readonly string[]).includes(value)

/**
 * Reads the role assignments back out of the Mermaid source.
 *
 * The converter carries the palette over as plain colours, so the role — what a
 * node *is* — survives only here. Matching on fill colour instead would break
 * the moment two roles shared a shade.
 */
export function parseDiagramRoles(mermaid: string): DiagramRoleMap {
  const roles: DiagramRoleMap = new Map()

  for (const line of mermaid.split('\n')) {
    const assignment = line.match(CLASS_ASSIGNMENT)
    if (assignment?.[1] && assignment[2] && isRole(assignment[2])) {
      const role = assignment[2]
      for (const id of assignment[1].split(',')) {
        const trimmed = id.trim()
        if (trimmed) roles.set(trimmed, role)
      }
    }

    for (const inline of line.matchAll(INLINE_ROLE)) {
      if (inline[1] && inline[2] && isRole(inline[2])) roles.set(inline[1], inline[2])
    }
  }

  return roles
}
