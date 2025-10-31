/**
 * Phase Duration Recalculation API Route
 *
 * POST /api/phases/[id]/recalculate-duration - Manually recalculate phase duration from tasks
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserByClerkId } from '@/lib/services/user.service';
import { recalculatePhaseDuration, getPhaseById } from '@/lib/services/phase.service';
import { AuthenticationError, handleApiError, ValidationError } from '@/lib/utils/errors';

/**
 * POST /api/phases/[id]/recalculate-duration
 * Manually trigger recalculation of phase duration based on tasks
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;

    // Verify phase exists and belongs to organization
    await getPhaseById(id, user.organization_id);

    // Parse body to check for forceUpdate flag
    let forceUpdate = false;
    try {
      const body = await req.json();
      forceUpdate = body.forceUpdate === true;
    } catch {
      // Body is optional, default to false
    }

    // Recalculate phase duration
    const result = await recalculatePhaseDuration(id, user.organization_id, forceUpdate);

    return NextResponse.json(
      {
        phase: result,
        calculation: result.calculation,
        message: 'Phase duration recalculated successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
