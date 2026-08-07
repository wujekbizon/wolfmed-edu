import { stripMermaidLabels } from '@/helpers/stripMermaidLabels'
import { rewriteGroupRefs } from './rewriteGroupRefs'
import type { DiagramGroup } from '@/types/diagramTypes'

const SUBGRAPH_OPEN = /^\s*subgraph\s+([A-Za-z_][A-Za-z0-9_]*)\s*(?:\[\s*"?([^"\]]*)"?\s*\])?/
const BLOCK_END = /^\s*end\s*;?\s*$/
const DIRECTIVE = /^\s*(classDef|class|style|linkStyle|direction|flowchart|graph|%%)/
const IDENTIFIER = /[A-Za-z_][A-Za-z0-9_]*/g
const KEYWORDS = new Set(['TD', 'TB', 'LR', 'RL', 'BT', 'o', 'x'])

/**
 * Pulls the groups out of a flowchart and returns the source without them.
 *
 * The library this feeds looks a subgraph's container up by an id Mermaid 11
 * renders with a prefix, throws when it misses, and falls back to rasterising
 * the entire diagram — one image, no nodes. Rather than patch a dependency at
 * install time, Mermaid is never shown a subgraph: the groups come back as
 * data and the containers are drawn from the members' own bounding boxes.
 */
export function extractSubgraphs(mermaid: string): { source: string; groups: DiagramGroup[] } {
  const lines = mermaid.split('\n')
  const groups = new Map<string, DiagramGroup>()
  const stack: string[] = []
  const owner = new Map<string, string>()
  const kept: string[] = []

  for (const line of lines) {
    const opened = line.match(SUBGRAPH_OPEN)
    if (opened?.[1]) {
      const id = opened[1]
      groups.set(id, {
        id,
        title: (opened[2] || id).trim(),
        nodeIds: [],
        ancestors: [...stack].reverse(),
      })
      stack.push(id)
      continue
    }

    if (BLOCK_END.test(line)) {
      if (stack.length > 0) {
        stack.pop()
        continue
      }
    }

    kept.push(line)

    const innermost = stack[stack.length - 1]
    if (!innermost || DIRECTIVE.test(line)) continue

    for (const id of readIdentifiers(line)) {
      if (owner.has(id) || groups.has(id)) continue
      owner.set(id, innermost)
      groups.get(innermost)?.nodeIds.push(id)
    }
  }

  const all = [...groups.values()]
  const entryByGroup = new Map<string, string>()
  for (const group of all) {
    const entry = group.nodeIds[0] ?? firstNestedMember(group, all)
    if (entry) entryByGroup.set(group.id, entry)
  }

  return { source: rewriteGroupRefs(kept.join('\n'), entryByGroup), groups: all }
}

/** A group holding only other groups still needs a node for edges to land on. */
function firstNestedMember(group: DiagramGroup, groups: DiagramGroup[]): string | undefined {
  return groups.find((candidate) => candidate.ancestors.includes(group.id))?.nodeIds[0]
}

function readIdentifiers(line: string): string[] {
  const bare = stripMermaidLabels(line).replace(/\|[^|]*\|/g, ' ')
  return [...bare.matchAll(IDENTIFIER)].map((match) => match[0]).filter((id) => !KEYWORDS.has(id))
}
