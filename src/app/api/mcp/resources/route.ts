import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { mcpServer } from '@/server/mcp/server';
import { getAllUserNotes, getMaterialsByUser } from '@/server/queries';
import type { Resource } from '@/types/resourceTypes';

export async function GET() {
  try {
    const { userId } = await auth();

    const mcpResult = await mcpServer.readResource('docs://list');
    const fileList = mcpResult.contents?.[0]?.text
      ? JSON.parse(mcpResult.contents[0].text)
      : [];

    const docResources: Resource[] = fileList.map((filename: string) => ({
      name: filename,
      displayName: filename.replace('.md', '').replace(/_/g, ' '),
      type: 'doc' as const,
      icon: '📚',
    }));

    let userResources: Resource[] = [];

    if (userId) {
      const [notes, materials] = await Promise.all([
        getAllUserNotes(userId),
        getMaterialsByUser(userId),
      ]);

      const noteResources: Resource[] = notes.map((note) => ({
        name: `note://${note.id}`,
        displayName: note.title,
        type: 'note' as const,
        icon: '📝',
        metadata: {
          createdAt: note.createdAt,
          updatedAt: note.updatedAt,
        },
      }));

      const materialResources: Resource[] = materials.map((material) => ({
        name: `material://${material.id}`,
        displayName: material.title,
        type: 'material' as const,
        icon: '📄',
        metadata: {
          fileType: material.type,
          createdAt: material.createdAt,
        },
      }));

      userResources = [...noteResources, ...materialResources];
    }

    const allResources = [...userResources, ...docResources];

    return NextResponse.json({
      resources: allResources,
      counts: {
        docs: docResources.length,
        notes: userResources.filter((r) => r.type === 'note').length,
        materials: userResources.filter((r) => r.type === 'material').length,
      },
    });
  } catch (error) {
    console.error('Failed to list resources:', error);
    return NextResponse.json(
      {
        resources: [],
        error: 'Failed to fetch resources',
      },
      { status: 500 }
    );
  }
}
