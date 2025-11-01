import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, resolveError } from '@/lib/services/admin.service';

/**
 * POST /api/admin/errors/[id]/resolve
 *
 * Mark an error as resolved with optional notes.
 * Only accessible to admins.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    await requireAdmin(userId);

    // Get request body
    const body = await request.json();
    const { resolution_notes } = body;

    // Resolve error
    const { id } = await params;
    await resolveError(id, userId, resolution_notes);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error resolving error log:', error);

    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to resolve error' },
      { status: 500 }
    );
  }
}
