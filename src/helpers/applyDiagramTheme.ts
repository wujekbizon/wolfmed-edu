import { DIAGRAM_CLASSDEFS, DIAGRAM_GROUP_ROLE, DIAGRAM_ROLES } from '@/constants/diagramRoles'

const FLOWCHART_HEADER = /^\s*(flowchart|graph)\b/
const SUBGRAPH_ID = /^\s*subgraph\s+([A-Za-z_][\w]*)/
const CLASS_ASSIGNMENT = /^\s*class\s+([\w,\s]+?)\s+(\w+)\s*;?\s*$/
const INLINE_ROLE = /:::(\w+)/g

const isKnownRole = (role: string): boolean =>
  (DIAGRAM_ROLES as readonly string[]).includes(role) || role === DIAGRAM_GROUP_ROLE

/**
 * Applies the palette to model-generated Mermaid.
 *
 * The model assigns roles; the colors come from here, so a hallucinated hex can
 * never reach the canvas and the palette stays consistent across generations.
 * Any classDef/style the model emitted is dropped for that reason, as is a role
 * assignment naming a class that does not exist — Mermaid renders those nodes
 * unstyled instead of failing, which reads as a palette bug.
 *
 * Only flowcharts are themed: Mermaid rejects classDef in a sequenceDiagram.
 */
export function applyDiagramTheme(mermaid: string): string {
  const source = mermaid.trim()
  if (!FLOWCHART_HEADER.test(source)) return source

  const lines = source.split('\n')
  const header = lines[0]
  const subgraphIds: string[] = []

  const body = lines.slice(1).filter((line) => {
    const trimmed = line.trim()
    if (trimmed.startsWith('classDef ') || trimmed.startsWith('style ')) return false

    const subgraphId = line.match(SUBGRAPH_ID)?.[1]
    if (subgraphId) subgraphIds.push(subgraphId)

    const assignedRole = line.match(CLASS_ASSIGNMENT)?.[2]
    if (assignedRole && !isKnownRole(assignedRole)) return false

    return true
  })

  const cleanedBody = body.map((line) =>
    line.replace(INLINE_ROLE, (match, role: string) => (isKnownRole(role) ? match : ''))
  )

  const groupAssignments = subgraphIds.map((id) => `    class ${id} ${DIAGRAM_GROUP_ROLE}`)

  return [header, DIAGRAM_CLASSDEFS, ...cleanedBody, ...groupAssignments].join('\n')
}
