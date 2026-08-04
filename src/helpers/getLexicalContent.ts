interface LexicalNode {
  type: string
  text?: string
  children?: LexicalNode[]
}

// Block nodes end a thought, so they are separated by a blank line. Without this
// the editor's blocks concatenate into words that exist in no dictionary —
// "Transport Krwi w OrganizmieKrew" — which blurs the embedding of a chunk and
// removes the paragraph boundaries a chunker splits on.
const PARAGRAPH_BLOCKS = new Set(['paragraph', 'heading', 'quote', 'code', 'list', 'table'])

// Items inside a block are one per line, not one per paragraph.
const LINE_BLOCKS = new Set(['listitem', 'tablerow', 'tablecell'])

function extractText(node: LexicalNode): string {
  if (node.type === 'linebreak') return '\n'
  if (typeof node.text === 'string') return node.text
  if (!node.children) return ''

  const inner = node.children.map(extractText).join('')
  if (PARAGRAPH_BLOCKS.has(node.type)) return `${inner}\n\n`
  if (LINE_BLOCKS.has(node.type)) return `${inner}\n`
  return inner
}

export function getLexicalContent(jsonString: string): string {
  try {
    const root = JSON.parse(jsonString)?.root
    if (!root) return ''

    return extractText(root)
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  } catch {
    return ''
  }
}
