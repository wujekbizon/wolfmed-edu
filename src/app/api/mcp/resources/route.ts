import { NextResponse } from 'next/server';
import { mcpServer } from '@/server/mcp/server';

export async function GET() {
  try {
    const result = await mcpServer.readResource('docs://list');

    const fileList = result.contents?.[0]?.text
      ? JSON.parse(result.contents[0].text)
      : [];

    const resources = fileList.map((filename: string) => ({
      name: filename,
      displayName: filename.replace('.md', '').replace(/_/g, ' '),
    }));

    return NextResponse.json({ resources });
  } catch (error) {
    console.error('Failed to list resources:', error);
    return NextResponse.json({ resources: [] }, { status: 500 });
  }
}
