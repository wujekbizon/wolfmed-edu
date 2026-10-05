import type { InputHTMLAttributes, ReactNode } from 'react'

export default function RadioOption({ children, ...props }: InputHTMLAttributes<HTMLInputElement> & { children: ReactNode }) {
  return <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-zinc-200 p-3 has-checked:border-rose-500 has-checked:bg-rose-50 has-focus-visible:ring-2 has-focus-visible:ring-rose-500">
    <input {...props} type="radio" className="mt-1 shrink-0 accent-rose-600" />
    <span className="min-w-0 break-words">{children}</span>
  </label>
}
