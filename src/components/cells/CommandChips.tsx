'use client'

import { PALETTE_COMMANDS } from '@/constants/toolCommands'

interface CommandChipsProps {
  selectedName: string | null
  onToggle: (name: string) => void
  disabled?: boolean | undefined
}

export default function CommandChips({ selectedName, onToggle, disabled }: CommandChipsProps) {
  return (
    <div className="flex gap-1.5 overflow-x-auto scrollbar-thin scrollbar-webkit pb-1">
      {PALETTE_COMMANDS.map((command) => (
        <button
          key={command.name}
          type="button"
          onClick={() => onToggle(command.name)}
          disabled={disabled}
          title={command.description}
          aria-pressed={command.name === selectedName}
          className="chip"
        >
          {command.label}
        </button>
      ))}
    </div>
  )
}
