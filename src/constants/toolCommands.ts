/**
 * Single source of truth for `/command` routing.
 *
 * `requiresSource` marks tools that must not run without grounded material —
 * they fabricate plausible-looking content from an empty prompt rather than
 * declining, because the dispatch call forces a function call.
 */
export const TOOL_COMMANDS: Record<string, { toolName: string; requiresSource?: boolean }> = {
  notatka: { toolName: 'notatka_tool' },
  utworz: { toolName: 'utworz_test', requiresSource: true },
  podsumuj: { toolName: 'podsumuj', requiresSource: true },
  diagram: { toolName: 'diagram_tool' },
  fiszka: { toolName: 'fiszka_tool', requiresSource: true },
  planuj: { toolName: 'planuj_tool' },
  wyklad: { toolName: 'wyklad_tool' },
}

export const TOOL_COMMAND_NAMES = Object.keys(TOOL_COMMANDS)
