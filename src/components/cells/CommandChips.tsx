'use client'

import { TOOL_COMMAND_LIST } from '@/constants/toolCommands'

interface CommandChipsProps {
  selectedName: string | null
  onToggle: (name: string) => void
  disabled?: boolean | undefined
}

const CHIP_BASE =
  'shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
const CHIP_IDLE = 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50'
const CHIP_ACTIVE = 'border-zinc-800 bg-zinc-800 text-white hover:bg-zinc-700'

export default function CommandChips({ selectedName, onToggle, disabled }: CommandChipsProps) {
  return (
    <div className="flex gap-1.5 overflow-x-auto scrollbar-thin scrollbar-webkit pb-1">
      {TOOL_COMMAND_LIST.map((command) => {
        const isActive = command.name === selectedName
        return (
          <button
            key={command.name}
            type="button"
            onClick={() => onToggle(command.name)}
            disabled={disabled}
            title={command.description}
            aria-pressed={isActive}
            className={`${CHIP_BASE} ${isActive ? CHIP_ACTIVE : CHIP_IDLE}`}
          >
            {command.label}
          </button>
        )
      })}
    </div>
  )
}
