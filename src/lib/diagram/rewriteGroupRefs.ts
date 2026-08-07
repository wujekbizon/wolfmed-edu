import { MERMAID_ID, MERMAID_ID_LIST } from '@/constants/mermaidSyntax'

const OPENERS: Record<string, string> = { '[': ']', '(': ')', '{': '}' }
const CLASS_LINE = new RegExp(
  String.raw`^(\s*class\s+)(${MERMAID_ID_LIST}+?)(\s+${MERMAID_ID}\s*;?\s*)$`,
  'u'
)
const IDENTIFIER = new RegExp(MERMAID_ID, 'gu')

/**
 * Repoints edges that referred to a group.
 *
 * "Pilne --> Postepowanie" is legal Mermaid — an edge may target a subgraph.
 * Once the subgraphs are lifted out, that id belongs to nothing, and Mermaid
 * helpfully invents an empty node for it, leaving a stray box on the canvas.
 * The edge is aimed at the group's first member instead, which is the node the
 * arrow was visually reaching anyway.
 *
 * Role assignments are filtered rather than repointed: `class Ocena grupa`
 * describes the container, and repointing it would paint a member as a group.
 */
export function rewriteGroupRefs(source: string, entryByGroup: Map<string, string>): string {
  if (entryByGroup.size === 0) return source

  return source
    .split('\n')
    .map((line) => {
      const classLine = line.match(CLASS_LINE)
      if (classLine?.[2]) {
        const kept = classLine[2]
          .split(',')
          .map((id) => id.trim())
          .filter((id) => id && !entryByGroup.has(id))

        return kept.length > 0 ? `${classLine[1]}${kept.join(',')}${classLine[3]}` : ''
      }

      return rewriteOutsideLabels(line, entryByGroup)
    })
    .filter((line, index, all) => line !== '' || all[index] === '')
    .join('\n')
}

/** Label text is prose and may contain a group's name — only code is rewritten. */
function rewriteOutsideLabels(line: string, entryByGroup: Map<string, string>): string {
  let result = ''
  let buffer = ''
  let closer: string | null = null

  for (const char of line) {
    if (closer) {
      result += char
      if (char === closer) closer = null
      continue
    }

    if (OPENERS[char]) {
      result += replaceIds(buffer, entryByGroup) + char
      buffer = ''
      closer = OPENERS[char] ?? null
      continue
    }

    buffer += char
  }

  return result + replaceIds(buffer, entryByGroup)
}

function replaceIds(text: string, entryByGroup: Map<string, string>): string {
  return text.replace(IDENTIFIER, (id) => entryByGroup.get(id) ?? id)
}
