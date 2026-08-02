import type { MasteryLevel, MindMapNode } from "@/types/mindmapTypes"

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

/** Returns a new tree with an AI explanation stored on the target node. Pure. */
export function setNodeExplanation(
  root: MindMapNode,
  nodeId: string,
  explanation: string
): MindMapNode {
  function walk(node: MindMapNode): MindMapNode {
    if (node.id === nodeId) {
      return { ...node, metadata: { ...node.metadata, explanation } }
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

/**
 * Returns a new tree with every node at or below `depth` (that has children)
 * collapsed — a progressive-disclosure default so a fresh map opens showing only
 * the first ring, and each expand reveals one more level. Pure.
 */
export function collapseBelowDepth(root: MindMapNode, depth: number): MindMapNode {
  function walk(node: MindMapNode): MindMapNode {
    const children = node.children.map(walk)
    if (node.depth >= depth && node.children.length > 0) {
      return { ...node, collapsed: true, children }
    }
    return { ...node, children }
  }
  return walk(root)
}

/** Returns a new tree with every node expanded. Pure. */
export function expandAll(root: MindMapNode): MindMapNode {
  return { ...root, collapsed: false, children: root.children.map(expandAll) }
}

/** Node ids from the root down to the target node (inclusive), or null if absent. */
export function getNodePathIds(root: MindMapNode, nodeId: string): string[] | null {
  if (root.id === nodeId) return [root.id]
  for (const child of root.children) {
    const sub = getNodePathIds(child, nodeId)
    if (sub) return [root.id, ...sub]
  }
  return null
}

/** Labels from the root down to the target node (inclusive), or null if absent. */
export function getNodePath(root: MindMapNode, nodeId: string): string[] | null {
  if (root.id === nodeId) return [root.label]
  for (const child of root.children) {
    const sub = getNodePath(child, nodeId)
    if (sub) return [root.label, ...sub]
  }
  return null
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
