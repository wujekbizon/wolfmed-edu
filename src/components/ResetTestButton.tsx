import { useGenerateTestStore } from '@/store/useGenerateTestStore'

interface ResetTestButtonProps {
  resetTest: () => void
  disabled?: boolean
}

export default function ResetTestButton({ resetTest, disabled }: ResetTestButtonProps) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        resetTest()
      }}
      type="button"
      disabled={disabled}
      className="inline-flex h-10 w-full items-center justify-center whitespace-nowrap rounded-md border hover:border-zinc-800 border-red-200/40 hover:shadow-sm shadow shadow-zinc-500 bg-[#ffc5c5] hover:bg-[#e94d4d] px-8 py-2 text-base font-medium text-secondary-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 sm:w-1/2"
    >
      Zresetuj Test
    </button>
  )
}
