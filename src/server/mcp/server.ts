import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { readDocTool } from './tools/read-doc';
import { ReadDocInputSchema } from './types';

class WolfmedMcpServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'wolfmed-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'read',
          description: 'Read markdown files from /docs folder',
          inputSchema: {
            type: 'object',
            properties: {
              filename: {
                type: 'string',
                description: 'Filename to read from /docs folder (e.g., MCP_INTEGRATION_PLAN.md)',
              },
            },
            required: ['filename'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'read': {
          const validatedInput = ReadDocInputSchema.parse(args);
          return await readDocTool(validatedInput);
        }
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  async executeTool(toolName: string, args: unknown) {
    switch (toolName) {
      case 'read': {
        const validatedInput = ReadDocInputSchema.parse(args);
        return await readDocTool(validatedInput);
      }
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }
}

export const mcpServer = new WolfmedMcpServer();
