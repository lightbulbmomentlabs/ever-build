/**
 * Phase Contact Removal API Route
 *
 * DELETE /api/phases/[id]/contacts/[contactId] - Remove a contact from a phase
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserByClerkId } from '@/lib/services/user.service';
import { removeContactFromPhase } from '@/lib/services/phase.service';
import { AuthenticationError, handleApiError } from '@/lib/utils/errors';

/**
 * DELETE /api/phases/[id]/contacts/[contactId]
 * Remove a contact from a phase
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; contactId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new AuthenticationError();
    }

    const user = await getUserByClerkId(userId);
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    const { id: phaseId, contactId } = await params;
    await removeContactFromPhase(phaseId, contactId, user.organization_id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
