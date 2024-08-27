'use client'

import { useGenerateTestStore } from '@/store/useGenerateTestStore'

export default function RandomTestButon({
  children,
  disabled,
  number,
}: {
  children: React.ReactNode
  disabled?: boolean
  number: number
}) {
  const { setNumberTests, setIsTest } = useGenerateTestStore()

  // handler function to generate test
  const generateTest = (n: number | null) => {
    setNumberTests(n)
    setIsTest(true)
  }

  return (
    <button
      onClick={() => generateTest(number)}
      disabled={disabled}
      className="inline-flex h-8 w-full items-center justify-center whitespace-nowrap rounded-md border border-border/40 bg-neutral-950 px-16 py-2 text-sm font-medium text-secondary-foreground shadow transition-colors hover:bg-neutral-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 sm:w-128"
    >
      {children}
    </button>
  )
}
