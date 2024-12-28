interface LexicalNode {
  type: string
  text?: string
  children?: LexicalNode[]
}

export function getLexicalContent(jsonString: string): string {
  try {
    const parsed = JSON.parse(jsonString)
    const root = parsed.root

    function extractText(node: LexicalNode): string {
      if (node.text) return node.text
      if (node.children) {
        return node.children.map(extractText).join('')
      }
      return ''
    }

    return extractText(root)
  } catch {
    return ''
  }
}
