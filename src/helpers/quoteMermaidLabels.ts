import { MERMAID_ID } from '@/constants/mermaidSyntax'

const CLOSERS: Record<string, string> = { '[': ']', '(': ')', '{': '}' }
const NEEDS_QUOTING = /[()[\]{}]/
const DECLARATION = new RegExp(String.raw`(${MERMAID_ID})([[({])`, 'u')

/**
 * Quotes node labels that Mermaid would refuse to parse.
 *
 * "Wchłanianie wody (bez ramienia wstępującego)" is exactly the phrasing this
 * material calls for, and Mermaid rejects an unquoted bracket inside a label —
 * the whole diagram fails, not the one node. The model is told to quote them;
 * this is the backstop for when it does not.
 *
 * A compound shape like `(["…"])` is left alone: its content is bracketed by
 * design, and quoting it would break the shape rather than save it.
 */
export function quoteMermaidLabels(mermaid: string): string {
  return mermaid
    .split('\n')
    .map((line) => quoteLine(line))
    .join('\n')
}

function quoteLine(line: string): string {
  let rest = line
  let out = ''

  for (;;) {
    const match = rest.match(DECLARATION)
    if (!match || match.index === undefined) return out + rest

    const opener = match[2] as string
    const openAt = match.index + match[1]!.length
    const next = rest[openAt + 1]

    // Compound shapes — ([, [[, (( and friends — carry their own brackets.
    if (next && (next === '[' || next === '(' || next === '{')) {
      out += rest.slice(0, openAt + 2)
      rest = rest.slice(openAt + 2)
      continue
    }

    const closeAt = findClose(rest, openAt, opener)
    if (closeAt === -1) return out + rest

    const inner = rest.slice(openAt + 1, closeAt)
    out += rest.slice(0, openAt + 1) + (needsQuotes(inner) ? `"${escapeQuotes(inner)}"` : inner)
    out += rest[closeAt]
    rest = rest.slice(closeAt + 1)
  }
}

/** Matching closer at depth zero, so a label may contain its own brackets. */
function findClose(text: string, openAt: number, opener: string): number {
  const closer = CLOSERS[opener]
  let depth = 0

  for (let i = openAt; i < text.length; i++) {
    if (text[i] === opener) depth++
    else if (text[i] === closer) {
      depth--
      if (depth === 0) return i
    }
  }

  return -1
}

function needsQuotes(inner: string): boolean {
  const trimmed = inner.trim()
  if (trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length > 1) return false
  return NEEDS_QUOTING.test(inner)
}

const escapeQuotes = (inner: string): string => inner.replace(/"/g, '#quot;')
