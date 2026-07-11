import { MAX_CHILDREN, MAX_DEPTH, type MindMapNode } from "./types"

// Combining diacritical marks (U+0300–U+036F), stripped after NFD so Polish
// letters like ł/ó/ż collapse to their ASCII base for slug ids.
const DIACRITICS = /[̀-ͯ]/g

function slugify(label: string): string {
  return label
    .toLowerCase()
    .normalize("NFD")
    .replace(DIACRITICS, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
}

/**
 * Repairs model drift before validation: regenerates unique ids, fixes depth
 * and parentId from actual tree position, clamps children per node, and drops
 * branches past MAX_DEPTH. Runs before Zod so most drift is fixed, not rejected.
 */
export function normalizeTree(root: MindMapNode): MindMapNode {
  let counter = 0

  function walk(node: MindMapNode, depth: number, parentId: string | null): MindMapNode {
    const base = slugify(node.label) || "node"
    const id = `${base}-${(counter++).toString(36)}`

    const rawChildren = Array.isArray(node.children) ? node.children : []
    const children =
      depth >= MAX_DEPTH
        ? []
        : rawChildren
            .slice(0, MAX_CHILDREN)
            .map((child) => walk(child, depth + 1, id))

    const normalized: MindMapNode = {
      id,
      label: node.label.trim(),
      parentId,
      depth,
      collapsed: node.collapsed ?? false,
      children,
    }
    if (node.metadata) normalized.metadata = node.metadata
    return normalized
  }

  return walk(root, 0, null)
}
