'use client'

type Option = { value: string; label: string }

// Native select of correct answers; the chosen full text renders below,
// because long clinical formulations don't fit in the closed control.
export default function SingleSelectRow({
  options,
  value,
  onChange,
  placeholder,
  ariaLabel,
}: {
  options: Option[]
  value: string | null
  onChange: (value: string) => void
  placeholder: string
  ariaLabel: string
}) {
  const selected = options.find((option) => option.value === value)

  return (
    <div className="flex flex-col gap-2.5">
      <select
        aria-label={ariaLabel}
        value={value ?? ''}
        onChange={(event) => event.target.value && onChange(event.target.value)}
        className="w-full max-w-xl rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700
          cursor-pointer focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-100"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {selected && (
        <p className="text-sm text-zinc-700 bg-rose-50 border border-rose-200 rounded-xl p-3">
          {selected.label}
        </p>
      )}
    </div>
  )
}
