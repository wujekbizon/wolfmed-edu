import { Scan } from 'lucide-react'
import DiagramIconButton from './DiagramIconButton'
import { DIAGRAM_SURFACE, type DiagramTheme } from '@/constants/diagramChrome'

interface DiagramControlsProps {
  isAuto: boolean
  theme: DiagramTheme
  onFit: () => void
}

/**
 * Shown only once the student has taken the camera: while auto-fit is on, the
 * diagram already reframes itself and the button would do nothing visible.
 *
 * The surface goes on the button rather than a wrapper around it. Excalidraw's
 * own top-right controls are bare 36px chips, and an island wrapper added its
 * padding and border on top, leaving ours 46px and visibly taller than the
 * Library button beside it.
 */
export default function DiagramControls({ isAuto, theme, onFit }: DiagramControlsProps) {
  if (isAuto) return null

  return (
    <DiagramIconButton
      icon={Scan}
      label="Dopasuj widok do rozmiaru komórki"
      theme={theme}
      onClick={onFit}
      className={`border shadow-md ${DIAGRAM_SURFACE[theme].panel}`}
    />
  )
}
