import Button from '@/components/ui/Button'
import type { DiagramSelection } from '@/types/diagramTypes'

interface DiagramNodeToolbarProps {
  selection: DiagramSelection
  onFocusNode: () => void
  onFocusGroup: () => void
}

/**
 * Zooming happens on an explicit press, not on selection: in an editable canvas
 * a click is often the start of a drag, and moving the camera under a student
 * who was reaching for a node is worse than making them press a button.
 */
export default function DiagramNodeToolbar({
  selection,
  onFocusNode,
  onFocusGroup,
}: DiagramNodeToolbarProps) {
  return (
    <div
      className="pointer-events-auto absolute z-20 flex -translate-x-1/2 -translate-y-full gap-1 rounded-lg border border-zinc-200 bg-white/95 p-1 shadow-md"
      style={{ left: selection.anchor.x, top: selection.anchor.y - 8 }}
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
