import { ResourceAutocomplete } from './ResourceAutocomplete'
import { CommandAutocomplete } from './CommandAutocomplete'
import type { Resource } from '@/types/resourceTypes'
import type { Command } from '@/types/commandTypes'

interface AIAutocompleteDropdownsProps {
  showResourceAutocomplete: boolean
  showCommandAutocomplete: boolean
  filteredResources: Resource[]
  filteredCommands: Command[]
  resourceSelectedIndex: number
  commandSelectedIndex: number
  resourcesLoading: boolean
  insertResource: (displayName: string) => void
  insertCommand: (name: string) => void
  direction?: 'up' | 'down'
}

export function AIAutocompleteDropdowns({
  showResourceAutocomplete,
  showCommandAutocomplete,
  filteredResources,
  filteredCommands,
  resourceSelectedIndex,
  commandSelectedIndex,
  resourcesLoading,
  insertResource,
  insertCommand,
  direction = 'down',
}: AIAutocompleteDropdownsProps) {
  return (
    <>
      {showResourceAutocomplete && !showCommandAutocomplete && (
        <ResourceAutocomplete
          resources={filteredResources}
          selectedIndex={resourceSelectedIndex}
          onSelect={insertResource}
          loading={resourcesLoading}
          direction={direction}
        />
      )}
      {showCommandAutocomplete && (
        <CommandAutocomplete
          commands={filteredCommands}
          selectedIndex={commandSelectedIndex}
          onSelect={insertCommand}
          direction={direction}
        />
      )}
    </>
  )
}
