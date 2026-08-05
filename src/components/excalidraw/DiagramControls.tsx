import Button from '@/components/ui/Button'

interface DiagramControlsProps {
  isAuto: boolean
  onFit: () => void
}

/**
 * Shown only once the student has taken the camera: while auto-fit is on, the
 * diagram already reframes itself and the button would do nothing visible.
 */
export default function DiagramControls({ isAuto, onFit }: DiagramControlsProps) {
  if (isAuto) return null

  return (
    <Button variant="secondary" size="sm" onClick={onFit} title="Dopasuj diagram do rozmiaru komórki">
      Dopasuj widok
    </Button>
  )
}
