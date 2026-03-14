import type { Command } from '@/types/commandTypes'

interface CommandAutocompleteProps {
  commands: Command[]
  selectedIndex: number
  onSelect: (name: string) => void
  direction?: 'up' | 'down'
}

export function CommandAutocomplete({
  commands,
  selectedIndex,
  onSelect,
  direction = 'down',
}: CommandAutocompleteProps) {
  const positionClass = direction === 'up' ? 'bottom-full mb-2' : 'mt-2'
  const compact = direction === 'up'

  if (commands.length === 0) {
    return (
      <div className={`absolute z-50 w-full ${positionClass} bg-white border border-zinc-200 rounded-lg shadow-lg`}>
        <div className="px-3 py-2 text-xs text-zinc-500">
          Nie znaleziono poleceń
        </div>
      </div>
    )
  }

  return (
    <div className={`absolute z-50 w-full ${positionClass} bg-white border border-zinc-200 rounded-lg shadow-lg overflow-y-auto ${compact ? 'max-h-48' : 'max-h-80'}`}>
      {commands.map((command, index) => (
        <button
          key={command.name}
          type="button"
          onClick={() => onSelect(command.name)}
          className={`
            w-full text-left transition-colors border-b last:border-b-0
            ${compact ? 'px-3 py-2' : 'px-4 py-3'}
            ${
              index === selectedIndex
                ? 'bg-zinc-100 border-l-4 border-l-zinc-800'
                : 'hover:bg-zinc-50'
            }
          `}
        >
          {compact ? (
            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className="font-mono font-semibold text-[11px] text-zinc-900 shrink-0">/{command.name}</span>
              <span className="text-[11px] text-zinc-500 truncate">— {command.description}</span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-zinc-900">/{command.name}</span>
                <span className="text-sm text-zinc-600">— {command.description}</span>
              </div>
              <div className="text-xs text-zinc-400 font-mono pl-1 mt-1">
                {command.example}
              </div>
            </>
          )}
        </button>
      ))}
    </div>
  )
}
