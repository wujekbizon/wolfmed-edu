import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { readDocTool } from './tools/read-doc';
import { ReadDocInputSchema } from './types';
import { readdir } from 'fs/promises';
import { join } from 'path';

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
          resources: {},
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

    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: 'docs://list',
          name: 'Available Documents',
          description: 'List of markdown files available in /docs folder',
          mimeType: 'application/json',
        },
      ],
    }));

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      if (uri === 'docs://list') {
        try {
          const docsPath = join(process.cwd(), 'docs');
          const files = await readdir(docsPath);
          const mdFiles = files.filter((f) => f.endsWith('.md'));

          return {
            contents: [
              {
                uri: 'docs://list',
                mimeType: 'application/json',
                text: JSON.stringify(mdFiles),
              },
            ],
          };
        } catch (error) {
          throw new Error('Failed to read docs directory');
        }
      }

      throw new Error(`Unknown resource URI: ${uri}`);
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

  async readResource(uri: string) {
    if (uri === 'docs://list') {
      try {
        const docsPath = join(process.cwd(), 'docs');
        const files = await readdir(docsPath);
        const mdFiles = files.filter((f) => f.endsWith('.md'));

        return {
          contents: [
            {
              uri: 'docs://list',
              mimeType: 'application/json',
              text: JSON.stringify(mdFiles),
            },
          ],
        };
      } catch (error) {
        throw new Error('Failed to read docs directory');
      }
    }

    throw new Error(`Unknown resource URI: ${uri}`);
  }
}

export const mcpServer = new WolfmedMcpServer();
