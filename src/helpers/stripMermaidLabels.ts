const INNERMOST_LABEL = /\[[^[\]]*\]|\([^()]*\)|\{[^{}]*\}/g
const MAX_NESTING = 10

/**
 * Blanks out label text, innermost group first, leaving the brackets in place.
 *
 * Anything scanning a Mermaid line for identifiers has to do this first: Polish
 * labels routinely contain brackets and words that read as node ids otherwise —
 * "Wstawki (dyski wtrącone)" parses as two nodes without it.
 *
 * The match is global on purpose. Emptying one label per pass stopped early on
 * a line with several: the first pass leaves "[]" behind, the second pass finds
 * it, replaces it with itself, and the loop reads that as nothing left to do —
 * leaving every later label on the line intact.
 */
export function stripMermaidLabels(line: string): string {
  let stripped = line.replace(/"[^"]*"/g, '')

  for (let pass = 0; pass < MAX_NESTING; pass++) {
    const next = stripped.replace(INNERMOST_LABEL, (match) => `${match[0]}${match[match.length - 1]}`)
    if (next === stripped) break
    stripped = next
  }

  return stripped
}
