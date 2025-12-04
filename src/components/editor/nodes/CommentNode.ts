import { $applyNodeReplacement, TextNode, SerializedTextNode, EditorConfig, LexicalEditor } from 'lexical'

export type SerializedCommentNode = SerializedTextNode & {
  commentText: string
  commentId: string
}

export class CommentNode extends TextNode {
  __commentText: string
  __commentId: string

  static getType(): string {
    return 'comment'
  }

  static clone(node: CommentNode): CommentNode {
    return new CommentNode(node.__text, node.__commentText, node.__commentId, node.__key)
  }

  constructor(text: string, commentText: string, commentId: string, key?: string) {
    super(text, key)
    this.__commentText = commentText
    this.__commentId = commentId
  }

  createDOM(config: EditorConfig, editor?: LexicalEditor): HTMLElement {
    const element = super.createDOM(config, editor)
    element.className = 'relative bg-amber-50/40 border-b-2 border-dotted border-amber-400 cursor-help'
    element.style.transition = 'all 0.2s ease'
    element.dataset.commentId = this.__commentId
    element.title = this.__commentText
    return element
  }

  updateDOM(prevNode: this, dom: HTMLElement, config: EditorConfig): boolean {
    const isUpdated = super.updateDOM(prevNode, dom, config)

    if (prevNode.__commentText !== this.__commentText || prevNode.__commentId !== this.__commentId) {
      dom.title = this.__commentText
      dom.dataset.commentId = this.__commentId
    }

    return isUpdated
  }

  setCommentText(commentText: string): void {
    const writable = this.getWritable()
    writable.__commentText = commentText
  }

  getCommentText(): string {
    return this.__commentText
  }

  getCommentId(): string {
    return this.__commentId
  }

  static importJSON(serializedNode: SerializedCommentNode): CommentNode {
    const node = $createCommentNode(
      serializedNode.text,
      serializedNode.commentText,
      serializedNode.commentId,
    )
    node.setFormat(serializedNode.format)
    node.setDetail(serializedNode.detail)
    node.setMode(serializedNode.mode)
    node.setStyle(serializedNode.style)
    return node
  }

  exportJSON(): SerializedCommentNode {
    return {
      ...super.exportJSON(),
      commentText: this.__commentText,
      commentId: this.__commentId,
      type: 'comment',
      version: 1,
    }
  }
}

export function $createCommentNode(
  text: string,
  commentText: string,
  commentId: string = `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
): CommentNode {
  return $applyNodeReplacement(new CommentNode(text, commentText, commentId))
}

export function $isCommentNode(
  node: any,
): node is CommentNode {
  return node instanceof CommentNode
}
