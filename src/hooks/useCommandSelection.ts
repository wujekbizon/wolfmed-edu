import { useCallback, useState } from 'react'
import { TOOL_COMMANDS } from '@/constants/toolCommands'
import { resolveCommandCount } from '@/helpers/resolveCommandCount'

/**
 * Holds the chip-selected command for one AI cell.
 *
 * Selecting a command is a mode, not text: the name and the item count travel to
 * the server as form fields rather than being typed into the question and
 * re-extracted by a model. Picking a command seeds its default count so the
 * field is never empty.
 */
export function useCommandSelection() {
  const [selectedName, setSelectedName] = useState<string | null>(null)
  const [count, setCount] = useState<number | null>(null)

  const command = selectedName ? TOOL_COMMANDS[selectedName] : undefined

  const select = useCallback((name: string) => {
    const next = TOOL_COMMANDS[name]
    if (!next) return
    setSelectedName(name)
    setCount(resolveCommandCount(next, next.count?.defaultValue))
  }, [])

  const clear = useCallback(() => {
    setSelectedName(null)
    setCount(null)
  }, [])

  const toggle = useCallback(
    (name: string) => {
      if (name === selectedName) clear()
      else select(name)
    },
    [selectedName, clear, select]
  )

  return { selectedName, command, count, setCount, select, clear, toggle }
}

export type CommandSelection = ReturnType<typeof useCommandSelection>
