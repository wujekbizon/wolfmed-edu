'use client'

import WypelnijSelect from '@/components/diagnozy/wypelnij/WypelnijSelect'

type Option = { value: string; label: string }

// Pick one correct answer; the chosen full text renders below, because long
// clinical formulations don't fit in the closed control.
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
    <div className="flex flex-col gap-2.5 min-w-0">
      <WypelnijSelect
        options={options}
        value={value}
        onSelect={onChange}
        placeholder={placeholder}
        ariaLabel={ariaLabel}
      />
      {selected && (
        <p className="text-sm text-zinc-700 bg-rose-50 border border-rose-200 rounded-xl p-3">
          {selected.label}
        </p>
      )}
    </div>
  )
}
