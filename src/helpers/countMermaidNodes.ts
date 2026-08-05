const DECLARATION = /(?:^|[\s>|-])([A-Za-z_][A-Za-z0-9_]*)(?:\[|\(|\{)/g
const DIRECTIVE = /^\s*(classDef|class|style|linkStyle|subgraph|end|flowchart|graph|direction)\b/
const INNERMOST_LABEL = /\[[^[\]]*\]|\([^()]*\)|\{[^{}]*\}/

/**
 * Label text is removed before scanning, innermost group first. Polish labels
 * routinely contain a bracket — "Wstawki (dyski wtrącone)" read as two nodes,
 * which inflated the count and could trigger a needless second model call.
 */
function stripLabels(line: string): string {
  let stripped = line.replace(/"[^"]*"/g, '')
  let previous: string

  do {
    previous = stripped
    stripped = stripped.replace(INNERMOST_LABEL, (match) => `${match[0]}${match[match.length - 1]}`)
  } while (stripped !== previous)

  return stripped
}

/**
 * Counts declared nodes — an id followed by a shape opener. Nodes appearing only
 * in an edge are already declared elsewhere, and subgraph containers are not
 * nodes, so both are skipped.
 */
export function countMermaidNodes(mermaid: string): number {
  const ids = new Set<string>()

  for (const line of mermaid.split('\n')) {
    if (DIRECTIVE.test(line)) continue

    for (const match of stripLabels(line).matchAll(DECLARATION)) {
      if (match[1]) ids.add(match[1])
    }
  }

  return ids.size
}
