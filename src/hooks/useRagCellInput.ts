import { useCallback } from 'react'
import { useResourceAutocomplete } from './useResourceAutocomplete'
import { useResourceAutocompleteInput } from './useResourceAutocompleteInput'
import { useCommandAutocompleteInput } from './useCommandAutocompleteInput'

/**
 * Composes resource (@-mention) and slash-command autocomplete into a single
 * input controller for the RAG cell textarea.
 *
 * Internally wires together useResourceAutocompleteInput and
 * useCommandAutocompleteInput, routing change and keydown events to the
 * active autocomplete. Command autocomplete takes priority — resource
 * autocomplete only activates when no command autocomplete is open.
 *
 * Exposes a single textareaRef (owned by useResourceAutocompleteInput and
 * shared with useCommandAutocompleteInput), merged event handlers, and all
 * autocomplete state needed to render the dropdown UIs.
 *
 * Usage:
 *   const input = useRagCellInput()
 *   <textarea ref={input.textareaRef} onChange={input.handleChange} onKeyDown={input.handleKeyDown} />
 *   {input.showResourceAutocomplete && <ResourceAutocomplete ... />}
 *   {input.showCommandAutocomplete && <CommandAutocomplete ... />}
 */
export function useRagCellInput() {
  const { resources, loading: resourcesLoading } = useResourceAutocomplete()

  const {
    textareaRef,
    showAutocomplete: showResourceAutocomplete,
    filteredResources,
    selectedIndex: resourceSelectedIndex,
    handleInputChange: handleResourceInputChange,
    handleKeyDown: handleResourceKeyDown,
    insertResource,
  } = useResourceAutocompleteInput(resources)

  const {
    showCommandAutocomplete,
    filteredCommands,
    commandSelectedIndex,
    handleCommandInputChange,
    handleCommandKeyDown,
    insertCommand,
  } = useCommandAutocompleteInput(textareaRef)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const cursorPos = e.target.selectionStart ?? 0
      const commandHandled = handleCommandInputChange(e.target.value, cursorPos)
      if (!commandHandled) {
        handleResourceInputChange(e)
      }
    },
    [handleCommandInputChange, handleResourceInputChange]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (showCommandAutocomplete) {
        const handled = handleCommandKeyDown(e)
        if (handled) return
      }
      if (showResourceAutocomplete) {
        handleResourceKeyDown(e)
      }
    },
    [showCommandAutocomplete, handleCommandKeyDown, showResourceAutocomplete, handleResourceKeyDown]
  )

  return {
    textareaRef,
    // Resource autocomplete
    showResourceAutocomplete,
    filteredResources,
    resourceSelectedIndex,
    resourcesLoading,
    insertResource,
    // Command autocomplete
    showCommandAutocomplete,
    filteredCommands,
    commandSelectedIndex,
    insertCommand,
    // Merged textarea handlers
    handleChange,
    handleKeyDown,
  }
}
