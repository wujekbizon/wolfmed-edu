'use client'

import Input from '@/components/ui/Input'
import Label from '@/components/ui/Label'
import CommandChips from './CommandChips'
import type { CommandSelection } from '@/hooks/useCommandSelection'

interface CommandBarProps {
  selection: CommandSelection
  disabled?: boolean | undefined
}

export default function CommandBar({ selection, disabled }: CommandBarProps) {
  const { selectedName, command, count, setCount, toggle } = selection
  const countSpec = command?.count

  return (
    <div className="space-y-2">
      <CommandChips selectedName={selectedName} onToggle={toggle} disabled={disabled} />

      {selectedName && <input type="hidden" name="command" value={selectedName} />}

      {countSpec && count !== null && (
        <div className="flex items-center gap-2">
          <Label htmlFor="commandCount" label={countSpec.label} className="text-xs text-zinc-500" />
          <Input
            id="commandCount"
            name="commandCount"
            type="number"
            value={count}
            min={countSpec.min}
            max={countSpec.max}
            step={1}
            disabled={disabled}
            onChangeHandler={(e) => setCount(Number(e.target.value))}
            ariaLabel={countSpec.label}
            className="w-20 rounded-lg border border-zinc-300 px-2 py-1 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-zinc-400"
          />
          <span className="text-xs text-zinc-400">
            {countSpec.min}–{countSpec.max}
          </span>
        </div>
      )}

      {command && (
        <p className="text-xs text-zinc-500">
          {command.description}. Wpisz temat, np. „{command.example}".
        </p>
      )}
    </div>
  )
}
