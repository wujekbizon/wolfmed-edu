import { readFile } from 'fs/promises';
import { join } from 'path';
import type { ReadDocInput, ToolResponse } from '../types';

export async function readDocTool(input: ReadDocInput): Promise<ToolResponse> {
  try {
    const docsPath = join(process.cwd(), 'docs', input.filename);
    let content = await readFile(docsPath, 'utf-8');

    const MAX_CHARS = 50000;
    if (content.length > MAX_CHARS) {
      content = content.substring(0, MAX_CHARS) + '\n\n[... content truncated due to size limit ...]';
    }

    return {
      content: [
        {
          type: 'text',
          text: content,
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return {
      content: [
        {
          type: 'text',
          text: `Error reading file: ${errorMessage}. Make sure the file exists in the /docs folder.`,
        },
      ],
    };
  }
}
