import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

export default function WizardFieldLabel({
  icon: Icon,
  children,
  htmlFor,
  className = 'mb-2',
}: {
  icon: LucideIcon
  children: ReactNode
  htmlFor?: string
  className?: string
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={`flex items-center gap-1.5 text-sm font-semibold text-zinc-700 ${className}`}
    >
      <Icon className="w-4 h-4 text-[#ff9898]" />
      {children}
    </label>
  )
}
