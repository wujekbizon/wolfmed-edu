import type { Category, MasteryLevel } from "./types"

// One color per main topic area. The five anchors (anatomy/pathology/treatment/
// physiology/diagnostics) are taken directly from the mockup; the remaining five
// extend the same palette in the same visual language.
export const CATEGORY_COLORS: Record<Category, string> = {
  anatomy: "#14b8a6", // teal (mockup)
  pathology: "#3b82f6", // blue (mockup)
  treatment: "#f97066", // coral (mockup)
  physiology: "#f59e0b", // amber (mockup)
  diagnostics: "#ec4899", // pink (mockup)
  pharmacology: "#8b5cf6", // violet
  epidemiology: "#06b6d4", // cyan
  genetics: "#a855f7", // purple
  immunology: "#10b981", // emerald
  other: "#6b7280", // gray
}

// Root (depth 0) has its own identity color, matching the mockup's purple root.
export const ROOT_COLOR = "#7c6df2"

// Circle diameters by depth: root → leaf. Sized so a wrapped 2-3 word Polish
// label fits inside the circle (labels render in-node, per the mockup).
export const DEPTH_SIZES = [104, 88, 72, 60] as const

// Leaf mastery overrides the category color.
export const MASTERY_COLORS: Record<MasteryLevel, string> = {
  unseen: "#9ca3af", // gray
  learning: "#f59e0b", // amber
  mastered: "#22c55e", // green
}

export function getCategoryColor(category?: Category): string {
  return category ? CATEGORY_COLORS[category] : CATEGORY_COLORS.other
}

export function getDepthSize(depth: number): number {
  const idx = Math.min(Math.max(depth, 0), DEPTH_SIZES.length - 1)
  return DEPTH_SIZES[idx] ?? 36
}

/** Mixes a hex color toward white by `amount` (0–1). Used for child inheritance. */
export function lightenColor(hex: string, amount: number): string {
  const clean = hex.replace("#", "")
  const num = parseInt(clean, 16)
  const r = (num >> 16) & 0xff
  const g = (num >> 8) & 0xff
  const b = num & 0xff
  const mix = (c: number) => Math.round(c + (255 - c) * amount)
  const toHex = (c: number) => c.toString(16).padStart(2, "0")
  return `#${toHex(mix(r))}${toHex(mix(g))}${toHex(mix(b))}`
}
