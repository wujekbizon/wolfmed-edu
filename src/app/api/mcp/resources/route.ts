import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getAllUserNotes, getMaterialsByUser } from '@/server/queries';
import type { Resource } from '@/types/resourceTypes';

export async function GET() {
  try {
    const { userId } = await auth();

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
        metadata: {
          createdAt: note.createdAt,
          updatedAt: note.updatedAt,
        },
      }));

      const materialResources: Resource[] = materials.map((material) => ({
        name: `material://${material.id}`,
        displayName: material.title,
        type: 'material' as const,
        metadata: {
          fileType: material.type,
          createdAt: material.createdAt,
        },
      }));

      userResources = [...noteResources, ...materialResources];
    }

    return NextResponse.json({
      resources: userResources,
      counts: {
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
