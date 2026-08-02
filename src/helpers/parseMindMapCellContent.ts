import type { MindMapCellContent } from '@/types/mindmapTypes'

export function parseMindMapCellContent(raw: string): MindMapCellContent | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as MindMapCellContent
    return parsed?.root ? parsed : null
  } catch {
    return null
  }
}
