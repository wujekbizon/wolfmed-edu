import type { EssayLexicalNode } from '@/types/essayTypes'

export function validateEssayNode(value: unknown, depth = 0, budget = { count: 0 }): EssayLexicalNode {
  budget.count++
  if (depth > 30 || budget.count > 5000 || !value || typeof value !== 'object') throw new Error('Dokument ma zbyt złożoną strukturę.')
  const node = value as EssayLexicalNode
  if (node.type === 'text' && typeof node.text !== 'string') throw new Error('Nieprawidłowy tekst dokumentu.')
  if (!['root', 'paragraph', 'heading', 'text', 'linebreak', 'tab', 'list', 'listitem', 'quote', 'link', 'code'].includes(node.type)) {
    throw new Error('Dokument zawiera element, którego nie można zapisać w PDF.')
  }
  if (node.text !== undefined && (typeof node.text !== 'string' || node.text.length > 50_000)) throw new Error('Nieprawidłowy tekst dokumentu.')
  if (node.format !== undefined && typeof node.format !== 'number' && typeof node.format !== 'string') throw new Error('Nieprawidłowe formatowanie.')
  if (node.tag !== undefined && !/^h[1-6]$/.test(node.tag)) throw new Error('Nieprawidłowy nagłówek.')
  if (node.url !== undefined && (typeof node.url !== 'string' || !/^(https?:\/\/|mailto:)/i.test(node.url))) throw new Error('Nieprawidłowy odnośnik.')
  if (node.children !== undefined) {
    if (!Array.isArray(node.children)) throw new Error('Nieprawidłowa struktura dokumentu.')
    node.children.forEach((child) => validateEssayNode(child, depth + 1, budget))
  }
  return node
}
