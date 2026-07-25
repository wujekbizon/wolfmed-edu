import type { SelectOption } from '@/types/uiTypes'

interface FilterSelect {
  value: string
  onChangeHandler: (value: string) => void
  options: SelectOption[]
  ariaLabel?: string
  id?: string
  name?: string
  disabled?: boolean
  className?: string
}

const baseClass =
  'h-10 rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-700 ' +
  'cursor-pointer focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-100 ' +
  'disabled:cursor-not-allowed disabled:opacity-60'

export default function FilterSelect({
  value,
  onChangeHandler,
  options,
  ariaLabel,
  id,
  name,
  disabled,
  className,
}: FilterSelect) {
  return (
    <select
      id={id}
      name={name}
      value={value}
      onChange={(e) => onChangeHandler(e.target.value)}
      disabled={disabled}
      aria-label={ariaLabel}
      className={className ? `${baseClass} ${className}` : baseClass}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
