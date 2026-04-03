import { z } from 'zod';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

export const ReadDocInputSchema = z.object({
  filename: z.string().describe('Filename to read from /docs folder (e.g., MCP_INTEGRATION_PLAN.md)'),
});

export type ReadDocInput = z.infer<typeof ReadDocInputSchema>;

export type ToolResponse = CallToolResult;
