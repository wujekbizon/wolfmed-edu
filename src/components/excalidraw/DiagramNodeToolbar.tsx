import { useLayoutEffect, type RefObject } from 'react'
import Button from '@/components/ui/Button'
import { applyAnchor } from '@/hooks/useDiagramSelection'
import type { DiagramAnchor, DiagramSelection } from '@/types/diagramTypes'

interface DiagramNodeToolbarProps {
  selection: DiagramSelection
  toolbarRef: RefObject<HTMLDivElement | null>
  anchorRef: RefObject<DiagramAnchor>
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
      className="pointer-events-auto absolute z-20 flex -translate-x-1/2 -translate-y-[calc(100%+8px)] gap-1 rounded-lg border border-zinc-200 bg-white/95 p-1 shadow-md"
    >
      {selection.kind === 'node' && (
        <Button variant="ghost" size="sm" onClick={onFocusNode} title="Powiększ ten element i jego powiązania">
          Powiększ
        </Button>
      )}
      {selection.groupId && (
        <Button variant="ghost" size="sm" onClick={onFocusGroup} title="Powiększ całą grupę">
          Pokaż grupę
        </Button>
      )}
    </div>
  )
}
