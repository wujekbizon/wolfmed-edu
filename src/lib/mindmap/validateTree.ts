import { MAX_CHILDREN, MAX_DEPTH, type MindMapNode } from "./types"

export interface TreeValidationResult {
  valid: boolean
  errors: string[]
}

// Verb giveaways that mean a label is a sentence, not a noun phrase.
const SENTENCE_VERBS =
  /\b(jest|są|był|była|były|ma|mają|powoduje|obejmuje|polega|występuje|prowadzi|is|are|was|were|has|have|causes|includes|consists|leads)\b/i

function isNounPhrase(label: string): boolean {
  const trimmed = label.trim()
  if (!trimmed) return false
  if (trimmed.endsWith("?") || trimmed.endsWith(".")) return false
  if (SENTENCE_VERBS.test(trimmed)) return false
  if (trimmed.split(/\s+/).length > 4) return false
  return true
}

/**
 * Structural + label validation, shared by the generation pipeline. Returns
 * every problem found so a retry prompt can be built from the messages.
 */
export function validateTree(root: MindMapNode): TreeValidationResult {
  const errors: string[] = []

  if (!root || typeof root !== "object") {
    return { valid: false, errors: ["Brak korzenia mapy."] }
  }

  const branches = Array.isArray(root.children) ? root.children : []
  if (branches.length < 3) {
    errors.push("Mapa musi mieć co najmniej 3 gałęzie na pierwszym poziomie.")
  }

  function walk(node: MindMapNode, expectedDepth: number, path: string): void {
    const label = typeof node.label === "string" ? node.label : ""
    if (!label.trim()) {
      errors.push(`Pusta etykieta w węźle "${path}".`)
    } else if (!isNounPhrase(label)) {
      errors.push(`Etykieta "${label}" nie jest rzeczownikową frazą.`)
    }

    if (node.depth !== expectedDepth) {
      errors.push(`Niespójna głębokość w węźle "${label}" (oczekiwano ${expectedDepth}).`)
    }
    if (expectedDepth > MAX_DEPTH) {
      errors.push(`Węzeł "${label}" przekracza maksymalną głębokość ${MAX_DEPTH}.`)
    }

    const children = Array.isArray(node.children) ? node.children : []
    if (children.length > MAX_CHILDREN) {
      errors.push(`Węzeł "${label}" ma więcej niż ${MAX_CHILDREN} dzieci.`)
    }
    children.forEach((child) => walk(child, expectedDepth + 1, label))
  }

  walk(root, 0, "root")

  return { valid: errors.length === 0, errors }
}
