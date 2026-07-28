export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost'
export type ButtonSize = 'sm' | 'md'

export const BUTTON_BASE =
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed'

export const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-[#f58a8a] hover:bg-[#ff5b5b] text-black border border-red-200/40 shadow hover:border-zinc-800 disabled:hover:bg-[#f58a8a] disabled:hover:border-red-200/40',
  secondary:
    'bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 shadow-sm hover:border-zinc-300',
  accent: 'bg-purple-600 hover:bg-purple-700 text-white',
  ghost: 'text-zinc-600 hover:text-zinc-800 hover:bg-zinc-100',
}

export const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 py-1.5 text-xs',
  md: 'h-10 px-4 py-2 text-base',
}
