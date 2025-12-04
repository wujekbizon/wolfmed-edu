import { $applyNodeReplacement, TextNode, SerializedTextNode, EditorConfig, LexicalEditor } from 'lexical'

export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink' | 'purple'

export type SerializedHighlightNode = SerializedTextNode & {
  highlightColor: HighlightColor
}

const HIGHLIGHT_COLORS: Record<HighlightColor, string> = {
  yellow: 'bg-yellow-200/60 border-b-2 border-yellow-400',
  green: 'bg-green-200/60 border-b-2 border-green-400',
  blue: 'bg-blue-200/60 border-b-2 border-blue-400',
  pink: 'bg-pink-200/60 border-b-2 border-pink-400',
  purple: 'bg-purple-200/60 border-b-2 border-purple-400',
}

export class HighlightNode extends TextNode {
  __highlightColor: HighlightColor

  static getType(): string {
    return 'highlight'
  }

  static clone(node: HighlightNode): HighlightNode {
    return new HighlightNode(node.__text, node.__highlightColor, node.__key)
  }

  constructor(text: string, highlightColor: HighlightColor = 'yellow', key?: string) {
    super(text, key)
    this.__highlightColor = highlightColor
  }

  createDOM(config: EditorConfig, editor?: LexicalEditor): HTMLElement {
    const element = super.createDOM(config, editor)
    const colorClass = HIGHLIGHT_COLORS[this.__highlightColor] || HIGHLIGHT_COLORS['yellow']
    element.className = colorClass
    element.style.transition = 'all 0.2s ease'
    return element
  }

  updateDOM(prevNode: this, dom: HTMLElement, config: EditorConfig): boolean {
    const isUpdated = super.updateDOM(prevNode, dom, config)
  
    if (prevNode.__highlightColor !== this.__highlightColor) {
      const colorClass = HIGHLIGHT_COLORS[this.__highlightColor] || HIGHLIGHT_COLORS['yellow']
      dom.className = colorClass
    }
  
    return isUpdated
  }

  setHighlightColor(color: HighlightColor): void {
    const writable = this.getWritable()
    writable.__highlightColor = color
  }

  getHighlightColor(): HighlightColor {
    return this.__highlightColor
  }

  static importJSON(serializedNode: SerializedHighlightNode): HighlightNode {
    const node = $createHighlightNode(
      serializedNode.text,
      serializedNode.highlightColor,
    )
    node.setFormat(serializedNode.format)
    node.setDetail(serializedNode.detail)
    node.setMode(serializedNode.mode)
    node.setStyle(serializedNode.style)
    return node
  }

  exportJSON(): SerializedHighlightNode {
    return {
      ...super.exportJSON(),
      highlightColor: this.__highlightColor,
      type: 'highlight',
      version: 1,
    }
  }
}

export function $createHighlightNode(
  text: string,
  color: HighlightColor = 'yellow',
): HighlightNode {
  return $applyNodeReplacement(new HighlightNode(text, color))
}

export function $isHighlightNode(
  node: any,
): node is HighlightNode {
  return node instanceof HighlightNode
}
