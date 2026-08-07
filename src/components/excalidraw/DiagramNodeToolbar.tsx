import { useLayoutEffect, type RefObject } from 'react'
import { Group, ZoomIn } from 'lucide-react'
import { applyAnchor } from '@/hooks/useDiagramSelection'
import DiagramIconButton from './DiagramIconButton'
import { DIAGRAM_SURFACE, type DiagramTheme } from '@/constants/diagramChrome'
import type { ToolbarPlacement } from '@/lib/diagram/toolbarPlacement'
import type { DiagramSelection } from '@/types/diagramTypes'

interface DiagramNodeToolbarProps {
  selection: DiagramSelection
  toolbarRef: RefObject<HTMLDivElement | null>
  anchorRef: RefObject<ToolbarPlacement>
  theme: DiagramTheme
  onFocusNode: () => void
  onFocusGroup: () => void
}

/**
 * Zooming happens on an explicit press, not on selection: in an editable canvas
 * a click is often the start of a drag, and moving the camera under a student
 * who was reaching for a node is worse than making them press a button.
 *
 * Position comes from a ref rather than props — it changes on every frame of a
 * camera move, which no component should re-render for.
 */
export default function DiagramNodeToolbar({
  selection,
  toolbarRef,
  anchorRef,
  theme,
  onFocusNode,
  onFocusGroup,
}: DiagramNodeToolbarProps) {
  // The element does not exist yet when the anchor is first computed, so the
  // opening position is applied once it does.
  useLayoutEffect(() => {
    applyAnchor(toolbarRef.current, anchorRef.current)
  }, [selection, toolbarRef, anchorRef])

  return (
    <div
      ref={toolbarRef}
      className={`pointer-events-auto absolute z-20 flex gap-0.5 rounded-lg border p-1 shadow-md ${DIAGRAM_SURFACE[theme].panel}`}
    >
      {selection.kind === 'node' && (
        <DiagramIconButton icon={ZoomIn} label="Powiększ element i jego powiązania" theme={theme} onClick={onFocusNode} />
      )}
      {selection.groupId && (
        <DiagramIconButton icon={Group} label="Powiększ całą grupę" theme={theme} onClick={onFocusGroup} />
      )}
    </div>
  )
}
