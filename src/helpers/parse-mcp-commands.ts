export interface ParsedMcpCommand {
  cleanQuestion: string;
  tools: Array<{
    name: string;
    args: Record<string, unknown>;
  }>;
}

export function parseMcpCommands(input: string): ParsedMcpCommand {
  const tools: Array<{ name: string; args: Record<string, unknown> }> = [];

  const readPattern = /\/read\s+([\w-]+\.md)/gi;
  let match;

  while ((match = readPattern.exec(input)) !== null) {
    tools.push({
      name: 'read',
      args: {
        filename: match[1],
      },
    });
  }

  const cleanQuestion = input.replace(readPattern, '').trim();

  return {
    cleanQuestion,
    tools,
  };
}
