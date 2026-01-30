export interface ParsedMcpCommand {
  cleanQuestion: string;
  resources: string[];
  tools: string[];
}

export function parseMcpCommands(input: string): ParsedMcpCommand {
  const resources: string[] = [];
  const tools: string[] = [];

  const resourcePattern = /@([\w\s-]+)/gi;
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

  const cleanQuestion = input
    .replace(resourcePattern, '')
    .replace(toolPattern, '')
    .trim();

  return {
    cleanQuestion,
    resources,
    tools,
  };
}
