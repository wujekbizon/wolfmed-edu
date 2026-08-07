import { stripMermaidLabels } from '@/helpers/stripMermaidLabels'
import { MERMAID_ID } from '@/constants/mermaidSyntax'

const SUBGRAPH_OPEN = new RegExp(String.raw`^(\s*subgraph\s+)(${MERMAID_ID})(.*)$`, 'u')
const WORD_CHAR = String.raw`[\p{L}\p{N}_]`

/** Whole-identifier match, so "Uklad" does not match inside "UkladKrazenia". */
const mentions = (text: string, id: string): boolean =>
  new RegExp(String.raw`(?:^|(?!${WORD_CHAR})[^])${id}(?!${WORD_CHAR})`, 'u').test(text)
const BLOCK_END = /^\s*end\s*;?\s*$/

/**
 * Renames a subgraph whose own id is used as a node inside it.
 *
 * Mermaid treats that as a group containing itself and throws "Setting X as
 * parent of X would create a cycle", which fails the whole conversion — the
 * student gets no diagram at all. Referring to a group from *outside* is legal
 * and common ("Pilne --> Postepowanie"), so only self-references within the
 * group's own block are repaired.
 *
 * Renaming the container rather than the node resolves the ambiguity the way
 * the model most likely meant it: the id it gave a shape to stays the node, and
 * the group keeps its visible title, which was never the id.
 */
export function repairMermaidSubgraphs(mermaid: string): string {
  const lines = mermaid.split('\n')
  const stack: string[] = []
  const selfReferencing = new Set<string>()

  for (const line of lines) {
    const opened = line.match(SUBGRAPH_OPEN)
    if (opened?.[2]) {
      stack.push(opened[2])
      continue
    }

    if (BLOCK_END.test(line)) {
      stack.pop()
      continue
    }

    if (stack.length === 0) continue

    const bare = stripMermaidLabels(line)
    for (const id of stack) {
      if (mentions(bare, id)) selfReferencing.add(id)
    }
  }

  if (selfReferencing.size === 0) return mermaid

  return lines
    .map((line) => {
      const opened = line.match(SUBGRAPH_OPEN)
      if (!opened?.[2] || !selfReferencing.has(opened[2])) return line

      const [, prefix, id, rest] = opened
      // A bare `subgraph X` uses the id as the visible title, so it has to be
      // spelled out before the id changes.
      const title = rest?.trim() ? rest : `["${id}"]`
      return `${prefix}${id}_grupa${title}`
    })
    .join('\n')
}
