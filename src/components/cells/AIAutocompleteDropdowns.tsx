import { ResourceAutocomplete } from './ResourceAutocomplete'
import { CommandAutocomplete } from './CommandAutocomplete'
import type { RagCellInput } from '@/hooks/useRagCellInput'

interface AIAutocompleteDropdownsProps {
  input: RagCellInput
  direction?: 'up' | 'down'
}

export function AIAutocompleteDropdowns({
  input,
  direction = 'down',
}: AIAutocompleteDropdownsProps) {
  return (
    <>
      {input.showResourceAutocomplete && !input.showCommandAutocomplete && (
        <ResourceAutocomplete
          resources={input.filteredResources}
          selectedIndex={input.resourceSelectedIndex}
          onSelect={input.insertResource}
          loading={input.resourcesLoading}
          direction={direction}
        />
      )}
      {input.showCommandAutocomplete && (
        <CommandAutocomplete
          commands={input.filteredCommands}
          selectedIndex={input.commandSelectedIndex}
          onSelect={input.insertCommand}
          direction={direction}
        />
      )}
    </>
  )
}
