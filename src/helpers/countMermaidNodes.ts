const DECLARATION = /(?:^|[^\w])([A-Za-z_][\w]*)\s*(?:\[|\(|\{|>)/g
const DIRECTIVE = /^\s*(classDef|class|style|linkStyle|subgraph|end|flowchart|graph|direction)\b/

/**
 * Counts declared nodes — an id followed by a shape opener. Nodes appearing only
 * in an edge are already declared elsewhere, and subgraph containers are not
 * nodes, so both are skipped.
 */
export function countMermaidNodes(mermaid: string): number {
  const ids = new Set<string>()

  for (const line of mermaid.split('\n')) {
    if (DIRECTIVE.test(line)) continue

    for (const match of line.matchAll(DECLARATION)) {
      if (match[1]) ids.add(match[1])
    }
  }

  return ids.size
}
