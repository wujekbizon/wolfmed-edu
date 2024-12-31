interface LexicalNode {
  type: string
  text?: string
  format?: number
  children?: LexicalNode[]
  tag?: string
  url?: string
  listType?: 'number' | 'bullet'
  checked?: boolean
  language?: string
}

/**
 * Converts Lexical editor state JSON to HTML string.
 * Preserves text formatting and structure from the Lexical editor.
 *
 * Format values in Lexical:
 * - 0: Normal text
 * - 1: Bold
 * - 2: Italic
 * - 3: Bold + Italic
 * - 4: Underline
 * - 5: Bold + Underline
 * - 6: Italic + Underline
 * - 7: Bold + Italic + Underline
 * - 8: Strikethrough
 *
 * Node types:
 * - paragraph: Basic text block
 * - heading: h1, h2, h3
 * - list: Ordered or unordered lists
 * - listitem: Individual list items
 * - quote: Blockquotes
 * - code: Code blocks
 * - link: Hyperlinks
 *
 * @param jsonString - The Lexical editor state as JSON string
 * @returns HTML string with preserved formatting
 */
export function lexicalToHtml(jsonString: string): string {
  try {
    const parsed = JSON.parse(jsonString)
    const root = parsed.root

    function formatText(text: string, format: number, url?: string): string {
      let result = text
      // Basic text formatting
      if (format & 1) result = `<strong>${result}</strong>`
      if (format & 2) result = `<em>${result}</em>`
      if (format & 4) result = `<u>${result}</u>`
      if (format & 8) result = `<s>${result}</s>`

      // Handle links
      if (url) {
        result = `<a href="${url}" class="text-red-400 hover:underline">${result}</a>`
      }

      return result
    }

    function nodeToHtml(node: LexicalNode): string {
      // Handle text nodes with formatting
      if (node.text) {
        return formatText(node.text, node.format || 0, node.url)
      }

      // Handle nodes with children
      if (node.children) {
        const childrenHtml = node.children.map(nodeToHtml).join('')

        // Handle different node types
        switch (node.type) {
          case 'paragraph':
            return `<p>${childrenHtml}</p>`

          case 'heading':
            const level = node.tag || 'h1'
            return `<${level} class="text-xl font-bold mb-4">${childrenHtml}</${level}>`

          case 'list':
            const listTag = node.listType === 'number' ? 'ol' : 'ul'
            const listClass = node.listType === 'number' ? 'list-decimal' : 'list-disc'
            return `<${listTag} class="ml-6 ${listClass}">${childrenHtml}</${listTag}>`

          case 'listitem':
            return `<li>${childrenHtml}</li>`

          case 'quote':
            return `<blockquote class="border-l-4 border-zinc-700 pl-4 my-4 italic">${childrenHtml}</blockquote>`

          case 'code':
            return `<pre><code class="block bg-zinc-800 rounded p-4 font-mono">${childrenHtml}</code></pre>`

          default:
            return childrenHtml
        }
      }

      return ''
    }

    return nodeToHtml(root)
  } catch (e) {
    console.error('Failed to parse Lexical content:', e)
    return ''
  }
}
