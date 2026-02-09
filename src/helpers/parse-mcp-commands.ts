export interface ParsedMcpCommand {
  cleanQuestion: string;
  resources: string[];
  tools: string[];
}

export function parseMcpCommands(input: string): ParsedMcpCommand {
  const resources: string[] = [];
  const tools: string[] = [];

  // Match @resource - supports Unicode (Polish chars), dots, numbers
  // Captures everything after @ until whitespace followed by / or end
  const resourcePattern = /@([^\n@]+?)(?=\s+\/|\s*$)/gi;
  let match;

  while ((match = resourcePattern.exec(input)) !== null) {
    if (match[1]) {
      resources.push(match[1].trim());
    }
  }

  const toolPattern = /\/(utworz|notatka|podsumuj|diagram|flashcards|quiz|tlumacz)/gi;
  while ((match = toolPattern.exec(input)) !== null) {
    if (match[1]) {
      tools.push(match[1]);
    }
  }

  // Remove @resources and /tools from question
  let cleanQuestion = input;
  for (const resource of resources) {
    cleanQuestion = cleanQuestion.replace(`@${resource}`, '');
  }
  cleanQuestion = cleanQuestion.replace(toolPattern, '').trim();

  return {
    cleanQuestion,
    resources,
    tools,
  };
}
