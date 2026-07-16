import type { LayoutMode } from '@/lib/mindmap/buildFlowGraph'

export interface MindMapControlsProps {
  layout: LayoutMode
  onLayoutChange: (layout: LayoutMode) => void
  onExport: () => void
  onExpandAll: () => void
  onCollapseAll: () => void
  onResetView: () => void
}
