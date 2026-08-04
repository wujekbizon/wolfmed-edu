import type { Command } from '@/types/commandTypes'
import { TOOL_COMMAND_LIST } from './toolCommands'

// Derived so the slash autocomplete can never offer a command the dispatcher
// doesn't know, or omit one it does. The two lists had drifted to five entries
// against seven before this was derived.
export const COMMANDS: Command[] = TOOL_COMMAND_LIST.map(({ name, description, example }) => ({
  name,
  description,
  example: `/${name} ${example}`,
}))
