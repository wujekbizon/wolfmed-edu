const INNERMOST_LABEL = /\[[^[\]]*\]|\([^()]*\)|\{[^{}]*\}/

/**
 * Blanks out label text, innermost group first, leaving the brackets in place.
 *
 * Anything scanning a Mermaid line for identifiers has to do this first: Polish
 * labels routinely contain brackets and words that read as node ids otherwise —
 * "Wstawki (dyski wtrącone)" parses as two nodes without it.
 */
export function stripMermaidLabels(line: string): string {
  let stripped = line.replace(/"[^"]*"/g, '')
  let previous: string

  do {
    previous = stripped
    stripped = stripped.replace(INNERMOST_LABEL, (match) => `${match[0]}${match[match.length - 1]}`)
  } while (stripped !== previous)

  return stripped
}
