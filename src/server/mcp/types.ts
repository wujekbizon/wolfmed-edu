import { z } from 'zod';

export const ReadDocInputSchema = z.object({
  filename: z.string().describe('Filename to read from /docs folder (e.g., MCP_INTEGRATION_PLAN.md)'),
});

export type ReadDocInput = z.infer<typeof ReadDocInputSchema>;

export interface ToolResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
}
