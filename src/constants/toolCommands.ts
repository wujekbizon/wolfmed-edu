/**
 * Single source of truth for `/command` routing.
 *
 * `requiresSource` marks tools that must not run without grounded material —
 * they fabricate plausible-looking content from an empty prompt rather than
 * declining, because the dispatch call forces a function call. Every command
 * that produces study material carries it: content invented from the model's
 * own knowledge is indistinguishable, to the student, from content built on
 * the curriculum.
 */
export const TOOL_COMMANDS: Record<string, { toolName: string; requiresSource?: boolean }> = {
  notatka: { toolName: 'notatka_tool', requiresSource: true },
  utworz: { toolName: 'utworz_test', requiresSource: true },
  podsumuj: { toolName: 'podsumuj', requiresSource: true },
  diagram: { toolName: 'diagram_tool', requiresSource: true },
  fiszka: { toolName: 'fiszka_tool', requiresSource: true },
  planuj: { toolName: 'planuj_tool', requiresSource: true },
  wyklad: { toolName: 'wyklad_tool', requiresSource: true },
}

export const TOOL_COMMAND_NAMES = Object.keys(TOOL_COMMANDS)
