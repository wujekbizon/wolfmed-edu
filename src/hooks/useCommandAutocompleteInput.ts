import { useState, useMemo, useCallback, RefObject } from 'react'
import type { Command } from '@/types/commandTypes'
import { COMMANDS } from '@/constants/commands'

/**
 * Manages slash-command autocomplete for a textarea.
 *
 * Detects when the user types "/" at the start of the input or after a space,
 * filters the static COMMANDS list against the typed query, and handles keyboard
 * navigation (↑ ↓ Enter Tab Escape). On selection it inserts the command directly
 * into the uncontrolled textarea via DOM mutation and dispatches a synthetic
 * "input" event so parent change handlers stay in sync.
 *
 * Designed to work alongside useResourceAutocompleteInput — the consumer is
 * responsible for routing input/keydown events to the correct hook based on
 * which autocomplete is currently active.
 *
 * Used in: RagCellForm (slash commands in the AI query textarea)
 */
export function useCommandAutocompleteInput(
  textareaRef: RefObject<HTMLTextAreaElement | null>
) {
  const [showCommandAutocomplete, setShowCommandAutocomplete] = useState(false)
  const [commandQuery, setCommandQuery] = useState('')
  const [commandSelectedIndex, setCommandSelectedIndex] = useState(0)

  const filteredCommands = useMemo(
    () => COMMANDS.filter((cmd) => cmd.name.toLowerCase().includes(commandQuery.toLowerCase())),
    [commandQuery]
  )

  const handleCommandInputChange = useCallback((value: string, cursorPos: number) => {
    const textBeforeCursor = value.substring(0, cursorPos)
    const lastSlashIndex = textBeforeCursor.lastIndexOf('/')

    if (lastSlashIndex !== -1) {
      const charBeforeSlash = lastSlashIndex > 0 ? textBeforeCursor[lastSlashIndex - 1] : ' '
      if (charBeforeSlash === ' ') {
        const query = textBeforeCursor.substring(lastSlashIndex + 1)
        if (!query.includes(' ')) {
          setCommandQuery(query)
          setShowCommandAutocomplete(true)
          setCommandSelectedIndex(0)
          return true
        }
      }
    }

    setShowCommandAutocomplete(false)
    return false
  }, [])

  const insertCommand = useCallback((commandName: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const cursorPos = textarea.selectionStart ?? 0
    const value = textarea.value

    const textBefore = value.substring(0, cursorPos)
    const slashIndex = textBefore.lastIndexOf('/')

    const newValue =
      value.substring(0, slashIndex) + `/${commandName} ` + value.substring(cursorPos)

    textarea.value = newValue
    const newCursorPos = slashIndex + commandName.length + 2
    textarea.setSelectionRange(newCursorPos, newCursorPos)
    textarea.focus()
    setShowCommandAutocomplete(false)

    const event = new Event('input', { bubbles: true })
    textarea.dispatchEvent(event)
  }, [textareaRef])

  const handleCommandKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showCommandAutocomplete) return false

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setCommandSelectedIndex((i) => Math.min(i + 1, filteredCommands.length - 1))
      return true
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setCommandSelectedIndex((i) => Math.max(i - 1, 0))
      return true
    } else if ((e.key === 'Enter' || e.key === 'Tab') && filteredCommands.length > 0) {
      e.preventDefault()
      const selected = filteredCommands[commandSelectedIndex]
      if (selected) insertCommand(selected.name)
      return true
    } else if (e.key === 'Escape') {
      setShowCommandAutocomplete(false)
      return true
    }

    return false
  }, [showCommandAutocomplete, filteredCommands, commandSelectedIndex, insertCommand])

  return {
    showCommandAutocomplete,
    filteredCommands,
    commandSelectedIndex,
    handleCommandInputChange,
    handleCommandKeyDown,
    insertCommand,
    closeCommandAutocomplete: () => setShowCommandAutocomplete(false),
  }
}
