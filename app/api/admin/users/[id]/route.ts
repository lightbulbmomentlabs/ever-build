import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, deleteUserAndData } from '@/lib/services/admin.service';

/**
 * DELETE /api/admin/users/[id]
 *
 * Delete a user and all associated data.
 * Only accessible to admins.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    await requireAdmin(userId);

    // Delete user and all associated data
    const { id } = await params;
    const adminEmail = user.emailAddresses[0]?.emailAddress || '';

    await deleteUserAndData(id, userId, adminEmail);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);

    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete user' },
      { status: 500 }
    );
  }
}
