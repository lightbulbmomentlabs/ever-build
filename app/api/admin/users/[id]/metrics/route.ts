import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, getUserActivityMetrics } from '@/lib/services/admin.service';

/**
 * GET /api/admin/users/[id]/metrics
 *
 * Get activity metrics for a specific user.
 * Only accessible to admins.
 */
export async function GET(
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

    // Get user metrics
    const { id } = await params;
    const metrics = await getUserActivityMetrics(id);

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching user metrics:', error);

    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch user metrics' },
      { status: 500 }
    );
  }
}
