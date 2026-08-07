import type { CardProps } from '@/constants/educationalPathCards'

export default function ToolListItem({
  feature,
  index,
  selected,
  onSelect,
  onKeyDown,
  registerRef,
}: {
  feature: CardProps
  index: number
  selected: boolean
  onSelect: () => void
  onKeyDown: (event: React.KeyboardEvent) => void
  registerRef: (node: HTMLButtonElement | null) => void
}) {
  return (
    <button
      ref={registerRef}
      type="button"
      role="tab"
      aria-selected={selected}
      tabIndex={selected ? 0 : -1}
      onClick={onSelect}
      onKeyDown={onKeyDown}
      className="group flex w-full items-start gap-4 border-t border-white/10 py-[18px] text-left first:border-t-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose-500 focus-visible:rounded-md"
    >
      <span
        className={`mt-1 w-[26px] flex-none font-mono text-[11px] font-medium transition-colors duration-300 ${
          selected ? 'text-rose-500' : 'text-white/30 group-hover:text-white/50'
        }`}
      >
        {String(index + 1).padStart(2, '0')}
      </span>

      <span className="min-w-0">
        <span
          className={`block text-[17px] font-semibold leading-[1.3] transition-colors duration-300 ${
            selected ? 'text-zinc-100' : 'text-white/50 group-hover:text-white/70'
          }`}
        >
          {feature.title}
        </span>

        {/* Collapsed with max-height so the open row animates rather than
            popping; the value only has to exceed the tallest description. */}
        <span
          className={`grid overflow-hidden transition-[max-height,opacity] duration-[400ms] ease-[cubic-bezier(.2,.7,.3,1)] motion-reduce:transition-none ${
            selected ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <span className="mt-2.5 block text-sm leading-[1.65] text-white/60 text-pretty">
            {feature.description}
          </span>
        </span>
      </span>
    </button>
  )
}
