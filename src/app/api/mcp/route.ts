import { NextResponse } from 'next/server';
import { mcpServer } from '@/server/mcp/server';

export async function POST(req: Request) {
  try {
    const { tool, args } = await req.json();

    console.log('[MCP API] Received request:', { tool, args });

    if (!tool || typeof tool !== 'string') {
      return NextResponse.json(
        { error: 'Tool name is required' },
        { status: 400 }
      );
    }

    const result = await mcpServer.executeTool(tool, args);

    console.log('[MCP API] Tool execution successful:', { tool, resultType: typeof result });

    return NextResponse.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error('[MCP API] Error:', {
      message: errorMessage,
      stack: errorStack,
      error
    });

    return NextResponse.json(
      { error: errorMessage, details: errorStack },
      { status: 500 }
    );
  }
}
