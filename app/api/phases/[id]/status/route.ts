/**
 * Phase Status Update API Route
 *
 * PATCH /api/phases/[id]/status - Update phase status
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserByClerkId } from '@/lib/services/user.service';
import { updatePhaseStatus } from '@/lib/services/phase.service';
import { phaseStatusUpdateSchema } from '@/lib/validations/phase';
import { AuthenticationError, handleApiError, ValidationError } from '@/lib/utils/errors';

/**
 * PATCH /api/phases/[id]/status
 * Update phase status with automatic date tracking
 */
export async function PATCH(
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

    // Parse and validate request body
    const body = await req.json();
    const validationResult = phaseStatusUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      throw new ValidationError(validationResult.error.issues[0].message);
    }

    const { id } = await params;
    const { status, actual_start_date, actual_end_date } = validationResult.data;

    const phase = await updatePhaseStatus(id, user.organization_id, status, {
      actual_start_date,
      actual_end_date,
    });

    return NextResponse.json({ phase }, { status: 200 });
  } catch (error) {
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
