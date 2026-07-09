import type { MasteryLevel, MindMapNode } from "./types"

/** Returns a new tree with the target node's mastery level set. Pure. */
export function setNodeMastery(
  root: MindMapNode,
  nodeId: string,
  level: MasteryLevel
): MindMapNode {
  function walk(node: MindMapNode): MindMapNode {
    if (node.id === nodeId) {
      return { ...node, metadata: { ...node.metadata, masteryLevel: level } }
    }
    if (node.children.length === 0) return node
    return { ...node, children: node.children.map(walk) }
  }
  return walk(root)
}

/** Returns a new tree with the target node's collapsed flag toggled. Pure. */
export function toggleNodeCollapse(root: MindMapNode, nodeId: string): MindMapNode {
  function walk(node: MindMapNode): MindMapNode {
    if (node.id === nodeId) {
      return { ...node, collapsed: !node.collapsed }
    }
    if (node.children.length === 0) return node
    return { ...node, children: node.children.map(walk) }
  }
  return walk(root)
}

/** Depth-first search for a node by id. */
export function findNode(root: MindMapNode, nodeId: string): MindMapNode | null {
  if (root.id === nodeId) return root
  for (const child of root.children) {
    const found = findNode(child, nodeId)
    if (found) return found
  }
  return null
}
