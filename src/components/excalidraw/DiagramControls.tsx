import { Group, Scan, ZoomIn } from 'lucide-react'
import DiagramIconButton from './DiagramIconButton'
import { DIAGRAM_SURFACE, type DiagramTheme } from '@/constants/diagramChrome'
import type { DiagramSelection } from '@/types/diagramTypes'

interface DiagramControlsProps {
  isAuto: boolean
  selection: DiagramSelection | null
  theme: DiagramTheme
  /** The compact layout stacks them under Excalidraw's side rail. */
  isVertical?: boolean
  onFit: () => void
  onFocus: () => void
}

/**
 * The canvas controls, beside Excalidraw's own.
 *
 * Zooming to a selection used to be a toolbar floating over the selected node.
 * Selecting something already says what to act on, so the control does not also
 * need to point at it — and a fixed position cannot drift off the cell, collide
 * with Excalidraw's tool island, or be hard to hit with a thumb.
 *
 * Fit appears only once the student has taken the camera: while auto-fit is on
 * the diagram reframes itself and the button would do nothing visible.
 *
 * The surface goes on each button rather than a wrapper around them.
 * Excalidraw's own top-right controls are bare 36px chips, and an island
 * wrapper left ours visibly taller than the Library button beside it.
 */
export default function DiagramControls({
  isAuto,
  selection,
  theme,
  isVertical = false,
  onFit,
  onFocus,
}: DiagramControlsProps) {
  if (isAuto && !selection) return null

  const chrome = `border shadow-md ${DIAGRAM_SURFACE[theme].panel}`

  return (
    <div className={`flex gap-1 ${isVertical ? 'flex-col' : ''}`}>
      {selection && (
        <DiagramIconButton
          icon={selection.kind === 'group' ? Group : ZoomIn}
          label={
            selection.kind === 'group' ? 'Powiększ zaznaczoną grupę' : 'Powiększ zaznaczony element'
          }
          theme={theme}
          onClick={onFocus}
          className={chrome}
        />
      )}
      {!isAuto && (
        <DiagramIconButton
          icon={Scan}
          label="Dopasuj widok do rozmiaru komórki"
          theme={theme}
          onClick={onFit}
          className={chrome}
        />
      )}
    </div>
  )
}
