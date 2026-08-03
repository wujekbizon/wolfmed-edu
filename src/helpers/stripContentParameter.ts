interface ToolDefinitionShape {
  name: string
  description: string
  parameters: any
}

/**
 * Removes the `content` parameter from a tool declaration before dispatch.
 *
 * The dispatcher already holds the source material, so asking the model to echo
 * it back as a function argument buys nothing and costs an output token per
 * input token. Past a dozen retrieved chunks the echo overruns the output budget
 * and the call arrives truncated, which surfaces as "tool was not called".
 *
 * Only strip when the caller can supply the text itself. A PDF attachment is the
 * exception: there the model's extraction is the content, so it must stay.
 */
export function stripContentParameter(definition: ToolDefinitionShape): ToolDefinitionShape {
  const { content: _content, ...properties } = definition.parameters?.properties ?? {}
  const required: string[] = definition.parameters?.required ?? []

  return {
    ...definition,
    parameters: {
      ...definition.parameters,
      properties,
      required: required.filter((name) => name !== 'content'),
    },
  }
}
