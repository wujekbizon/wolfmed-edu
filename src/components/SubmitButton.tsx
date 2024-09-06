'use client'

import { useFormStatus } from 'react-dom'

type SubmitButtonProps = {
  label: string
  loading: React.ReactNode
  disabled?: boolean
}

const SubmitButton = ({ label, loading, disabled }: SubmitButtonProps) => {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="inline-flex h-10 w-full items-center justify-center whitespace-nowrap rounded-md bg-[#f58a8a] hover:bg-[#ff5b5b] px-4 py-2 text-lg font-medium border text-black shadow transition-colors hover:border-zinc-800 border-red-200/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
    >
      {pending ? loading : label}
    </button>
  )
}
export default SubmitButton
