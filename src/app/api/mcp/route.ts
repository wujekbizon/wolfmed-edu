import { NextResponse } from 'next/server';
import { mcpServer } from '@/server/mcp/server';

export async function POST(req: Request) {
  try {
    const { tool, args } = await req.json();

    if (!tool || typeof tool !== 'string') {
      return NextResponse.json(
        { error: 'Tool name is required' },
        { status: 400 }
      );
    }

    const result = await mcpServer.executeTool(tool, args);

    return NextResponse.json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
