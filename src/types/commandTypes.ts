export interface CommandCountSpec {
  // The tool argument this number fills — questionCount, cardCount, …
  param: string
  label: string
  defaultValue: number
  min: number
  max: number
}

export interface ToolCommand {
  name: string
  toolName: string
  label: string
  description: string
  example: string
  // Tools that fabricate plausible content from an empty prompt rather than
  // declining, because the dispatch call forces a function call.
  requiresSource?: boolean
  // Present when the command produces a countable number of items. The count
  // travels as a form field, never as prose for the model to re-extract.
  count?: CommandCountSpec
  // Kept out of the chip palette while staying fully dispatchable by slash —
  // for tools that belong to another surface but must remain reachable.
  hiddenFromPalette?: boolean
}

export interface Command {
  name: string
  description: string
  example: string
}
