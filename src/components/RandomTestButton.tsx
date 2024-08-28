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
      className="inline-flex h-9 w-full md:w-48 items-center justify-center rounded-md border hover:border-zinc-800 border-red-200/40 hover:shadow-sm shadow shadow-zinc-500 bg-[#ffc5c5] hover:bg-[#f58a8a] text-base font-semibold text-secondary-foreground transition-all hover:scale-95  focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
    >
      {children}
    </button>
  )
}
