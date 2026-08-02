'use client'

interface SettingsToggleProps {
  label: string
  description: string
  checked: boolean
  onChange: (value: boolean) => void
}

export default function SettingsToggle({
  label,
  description,
  checked,
  onChange,
}: SettingsToggleProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-zinc-200">{label}</p>
        <p className="text-xs text-zinc-500 mt-0.5">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 transition-colors duration-200
          ${checked ? 'bg-rose-400 border-rose-400' : 'bg-zinc-700 border-zinc-700'}`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200
            ${checked ? 'translate-x-5' : 'translate-x-0.5'}`}
        />
      </button>
    </div>
  )
}
