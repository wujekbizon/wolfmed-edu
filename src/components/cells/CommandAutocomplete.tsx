import type { Command } from '@/types/commandTypes'

interface CommandAutocompleteProps {
  commands: Command[]
  selectedIndex: number
  onSelect: (name: string) => void
}

export function CommandAutocomplete({
  commands,
  selectedIndex,
  onSelect,
}: CommandAutocompleteProps) {
  if (commands.length === 0) {
    return (
      <div className="absolute z-50 w-full mt-2 bg-white border border-zinc-200 rounded-lg shadow-lg">
        <div className="px-4 py-3 text-sm text-zinc-500">
          Nie znaleziono poleceń
        </div>
      </div>
    )
  }

  return (
    <div className="absolute z-50 w-full mt-2 bg-white border border-zinc-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
      {commands.map((command, index) => (
        <button
          key={command.name}
          type="button"
          onClick={() => onSelect(command.name)}
          className={`
            w-full px-4 py-3 flex flex-col gap-1
            transition-colors border-b last:border-b-0
            text-left
            ${
              index === selectedIndex
                ? 'bg-zinc-100 border-l-4 border-l-zinc-800'
                : 'hover:bg-zinc-50'
            }
          `}
        >
          <div className="flex items-center gap-2">
            <span className="font-mono font-semibold text-zinc-900">/{command.name}</span>
            <span className="text-sm text-zinc-600">— {command.description}</span>
          </div>
          <div className="text-xs text-zinc-400 font-mono pl-1">
            {command.example}
          </div>
        </button>
      ))}
    </div>
  )
}
