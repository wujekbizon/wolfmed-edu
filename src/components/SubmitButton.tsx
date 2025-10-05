'use client'

import { useFormStatus } from 'react-dom'

type SubmitButtonProps = {
  label: string
  loading: React.ReactNode
  disabled: boolean
  className?: string
}

const SubmitButton = ({ label, loading, disabled, className }: SubmitButtonProps) => {
  const { pending } = useFormStatus()
  console.log(disabled)
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className={`inline-flex h-10 w-full items-center justify-center whitespace-nowrap rounded-md bg-[#f58a8a] hover:bg-[#ff5b5b] px-4 py-2 text-lg font-medium border text-black shadow transition-colors cursor-pointer hover:border-zinc-800 border-red-200/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:hover:bg-[#f58a8a] disabled:hover:border-red-200/40 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {pending ? loading : label}
    </button>
  )
}
export default SubmitButton
