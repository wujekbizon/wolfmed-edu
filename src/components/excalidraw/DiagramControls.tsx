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
 */
export default function DiagramControls({ isAuto, theme, onFit }: DiagramControlsProps) {
  if (isAuto) return null

  return (
    <div className={`flex rounded-lg border p-1 shadow-md ${DIAGRAM_SURFACE[theme].panel}`}>
      <DiagramIconButton icon={Scan} label="Dopasuj widok do rozmiaru komórki" theme={theme} onClick={onFit} />
    </div>
  )
}
