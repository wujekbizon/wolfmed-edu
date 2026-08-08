export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'cta'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'submit'
export type ButtonShape = 'soft' | 'rounded' | 'pill'

// Shadow and translate are in the transition list so a variant can lift or
// deepen on hover; a colours-only list makes those snap. Tailwind's translate
// utilities drive the `translate` property, not `transform`.
export const BUTTON_BASE =
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-medium transition-[color,background-color,border-color,box-shadow,translate] duration-200 ease-out motion-reduce:transition-none cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed'

export const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-[#f58a8a] hover:bg-[#ff5b5b] text-black border border-red-200/40 shadow hover:border-zinc-800 disabled:hover:bg-[#f58a8a] disabled:hover:border-red-200/40',
  secondary:
    'bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 shadow-sm hover:border-zinc-300',
  accent: 'bg-purple-600 hover:bg-purple-700 text-white',
  ghost: 'text-zinc-600 hover:text-zinc-800 hover:bg-zinc-100',
  // Raised rather than flat: a vertical gradient reads as a lit surface, the
  // inset highlight is the top edge catching that light, and the tinted shadow
  // grounds it against the warm page rather than greying it out.
  cta: 'bg-gradient-to-b from-rose-500 to-rose-600 text-white ring-1 ring-inset ring-white/25 shadow-[0_10px_24px_-10px_rgba(190,18,60,0.75)] hover:to-rose-700 hover:shadow-[0_18px_32px_-12px_rgba(190,18,60,0.85)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[0_6px_14px_-8px_rgba(190,18,60,0.8)] disabled:translate-y-0 disabled:from-zinc-400 disabled:to-zinc-500 disabled:shadow-none disabled:ring-white/10',
}

export const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 py-1.5 text-xs',
  md: 'h-10 px-4 py-2 text-base',
  // Section-level calls to action, where the button is the point of the
  // column rather than one control among several.
  lg: 'h-13 px-7 py-3 text-base font-semibold',
  // What SubmitButton shipped before it joined this scale, kept so the forms
  // already using it are not restyled by the move.
  submit: 'h-10 px-4 py-2 text-lg',
}

// Radius is a prop rather than something a caller adds through className: both
// would be border-radius utilities in the same layer, so which one won would
// come down to the order Tailwind happened to emit them in.
export const BUTTON_SHAPES: Record<ButtonShape, string> = {
  soft: 'rounded-md',
  rounded: 'rounded-lg',
  pill: 'rounded-full',
}
