import { useState, RefObject } from 'react'
import { COMMANDS, type Command } from '@/lib/commands'

export function useCommandAutocompleteInput(
  textareaRef: RefObject<HTMLTextAreaElement | null>
) {
  const [showCommandAutocomplete, setShowCommandAutocomplete] = useState(false)
  const [commandQuery, setCommandQuery] = useState('')
  const [commandSelectedIndex, setCommandSelectedIndex] = useState(0)

  const filteredCommands = COMMANDS.filter((cmd) =>
    cmd.name.toLowerCase().includes(commandQuery.toLowerCase())
  )

  const handleCommandInputChange = (value: string, cursorPos: number) => {
    const textBeforeCursor = value.substring(0, cursorPos)
    const lastSlashIndex = textBeforeCursor.lastIndexOf('/')

    if (lastSlashIndex !== -1) {
      const charBeforeSlash = lastSlashIndex > 0 ? textBeforeCursor[lastSlashIndex - 1] : ' '
      if (charBeforeSlash === ' ' || lastSlashIndex === 0) {
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
  }

  const handleCommandKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showCommandAutocomplete) return false

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setCommandSelectedIndex((i) => Math.min(i + 1, filteredCommands.length - 1))
      return true
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setCommandSelectedIndex((i) => Math.max(i - 1, 0))
      return true
    } else if (e.key === 'Enter' && filteredCommands.length > 0) {
      e.preventDefault()
      const selected = filteredCommands[commandSelectedIndex]
      if (selected) {
        insertCommand(selected.name)
      }
      return true
    } else if (e.key === 'Escape') {
      setShowCommandAutocomplete(false)
      return true
    } else if (e.key === 'Tab' && filteredCommands.length > 0) {
      e.preventDefault()
      const selected = filteredCommands[commandSelectedIndex]
      if (selected) {
        insertCommand(selected.name)
      }
      return true
    }

    return false
  }

  const insertCommand = (commandName: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const cursorPos = textarea.selectionStart || 0
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
  }

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
