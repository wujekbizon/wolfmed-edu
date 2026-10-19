import Button from '@/components/ui/Button'

interface Props {
  children: React.ReactNode
  onClick: () => void
  disabled: boolean
}

export default function LearningPaginationButton({ children, onClick, disabled }: Props) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant="softAccent"
      size="sm"
      className="min-w-24"
    >
      {children}
    </Button>
  )
}
