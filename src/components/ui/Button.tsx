import React from 'react'

type Variant = 'primary' | 'secondary' | 'accent' | 'ghost'
type Size = 'sm' | 'md'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const BASE =
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed'

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-[#f58a8a] hover:bg-[#ff5b5b] text-black border border-red-200/40 shadow hover:border-zinc-800 disabled:hover:bg-[#f58a8a] disabled:hover:border-red-200/40',
  secondary:
    'bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 shadow-sm hover:border-zinc-300',
  accent: 'bg-purple-600 hover:bg-purple-700 text-white',
  ghost: 'text-zinc-600 hover:text-zinc-800 hover:bg-zinc-100',
}

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 py-1.5 text-xs',
  md: 'h-10 px-4 py-2 text-base',
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', type = 'button', className = '', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    />
  )
)
Button.displayName = 'Button'

export default Button
