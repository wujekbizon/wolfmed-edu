import { TOOL_COMMANDS } from '@/constants/toolCommands'

export interface ParsedMcpCommand {
  cleanQuestion: string;
  resources: string[];
  tools: string[];
  unknownTools: string[];
}

// Only a slash that starts a token is a command, so "https://host" and "and/or" are left alone.
// Built per call because a shared /g regex carries lastIndex between invocations.
const commandPattern = () => /(?<![\p{L}\p{N}/])\/(\p{L}+)/gu;

export function parseMcpCommands(input: string): ParsedMcpCommand {
  const resources: string[] = [];
  const tools: string[] = [];
  const unknownTools: string[] = [];

  // Match @resource - supports Unicode (Polish chars), dots, numbers
  // Captures everything after @ until whitespace followed by / or end
  const resourcePattern = /@([^\n@]+?)(?=\s+\/|\s*$)/gi;
  let match;

  while ((match = resourcePattern.exec(input)) !== null) {
    if (match[1]) {
      resources.push(match[1].trim());
    }
  }

  const toolPattern = commandPattern();
  while ((match = toolPattern.exec(input)) !== null) {
    const name = match[1]?.toLowerCase();
    if (!name) continue;

    if (TOOL_COMMANDS[name]) tools.push(name);
    else unknownTools.push(match[1]!);
  }

  // Remove @resources and /tools from question
  let cleanQuestion = input;
  for (const resource of resources) {
    cleanQuestion = cleanQuestion.replace(`@${resource}`, '');
  }
  cleanQuestion = cleanQuestion.replace(commandPattern(), '').trim();

  return {
    cleanQuestion,
    resources,
    tools,
    unknownTools,
  };
}
