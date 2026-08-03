import type { ToolCommand } from '@/types/commandTypes'

/**
 * Single source of truth for `/command` routing, the chip palette and the slash
 * autocomplete. All three read this list, so a command cannot exist in one
 * surface and be missing from another.
 *
 * `requiresSource` marks tools that must not run without grounded material —
 * they fabricate plausible-looking content from an empty prompt rather than
 * declining, because the dispatch call forces a function call. Every command
 * that produces study material carries it: content invented from the model's
 * own knowledge is indistinguishable, to the student, from content built on
 * the curriculum.
 *
 * `count` marks the commands producing a countable number of items. The number
 * reaches the tool as a validated form field and overrides whatever the dispatch
 * model extracted — asking for 10 and receiving 5 was a reported bug, caused by
 * making an LLM re-read a number the student had already typed.
 *
 * `hiddenFromPalette` keeps a command out of the chip row without removing it:
 * `fiszka` and `wyklad` belong to the flashcard cell and the lecture flow, so
 * they are not offered as buttons, but both stay dispatchable by slash and by
 * the code paths that call their tools directly.
 */
export const TOOL_COMMANDS: Record<string, ToolCommand> = {
  notatka: {
    name: 'notatka',
    toolName: 'notatka_tool',
    label: 'Notatka',
    description: 'Tworzy gotową notatkę',
    example: 'Stwórz notatkę o działach w fizjologii',
    requiresSource: true,
  },
  utworz: {
    name: 'utworz',
    toolName: 'utworz_test',
    label: 'Test',
    description: 'Generuje pytania testowe',
    example: 'Anatomia serca',
    requiresSource: true,
    count: { param: 'questionCount', label: 'Liczba pytań', defaultValue: 5, min: 1, max: 30 },
  },
  podsumuj: {
    name: 'podsumuj',
    toolName: 'podsumuj',
    label: 'Podsumowanie',
    description: 'Podsumowuje materiał źródłowy',
    example: 'Podsumuj układ oddechowy',
    requiresSource: true,
  },
  diagram: {
    name: 'diagram',
    toolName: 'diagram_tool',
    label: 'Diagram',
    description: 'Generuje diagram wizualny',
    example: 'Utwórz schemat budowy serca',
    requiresSource: true,
  },
  fiszka: {
    name: 'fiszka',
    toolName: 'fiszka_tool',
    label: 'Fiszki',
    description: 'Generuje fiszki edukacyjne',
    example: 'Układ kostny',
    requiresSource: true,
    count: { param: 'cardCount', label: 'Liczba fiszek', defaultValue: 10, min: 1, max: 50 },
    hiddenFromPalette: true,
  },
  planuj: {
    name: 'planuj',
    toolName: 'planuj_tool',
    label: 'Plan nauki',
    description: 'Tworzy szczegółowy plan nauki',
    example: 'Anatomia kończyny górnej',
    requiresSource: true,
  },
  wyklad: {
    name: 'wyklad',
    toolName: 'wyklad_tool',
    label: 'Wykład',
    description: 'Generuje wykład z planu nauki',
    example: 'Fizjologia układu krążenia',
    requiresSource: true,
    hiddenFromPalette: true,
  },
}

export const TOOL_COMMAND_NAMES = Object.keys(TOOL_COMMANDS)

export const TOOL_COMMAND_LIST = Object.values(TOOL_COMMANDS)

// What the chip row offers. Slash still reaches everything in TOOL_COMMANDS.
export const PALETTE_COMMANDS = TOOL_COMMAND_LIST.filter((c) => !c.hiddenFromPalette)
