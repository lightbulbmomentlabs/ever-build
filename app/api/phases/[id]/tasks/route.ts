/**
 * Phase Tasks API Routes
 *
 * POST /api/phases/[phaseId]/tasks - Create a new task under a phase
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserByClerkId } from '@/lib/services/user.service';
import {
  createPhase,
  getPhaseById,
  recalculatePhaseDuration,
  validateTaskDates
} from '@/lib/services/phase.service';
import { phaseSchema } from '@/lib/validations/phase';
import { AuthenticationError, handleApiError, ValidationError } from '@/lib/utils/errors';

/**
 * POST /api/phases/[phaseId]/tasks
 * Create a new task under a phase
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

    const { id: phaseId } = await params;

    // Verify parent phase exists and belongs to organization
    const parentPhase = await getPhaseById(phaseId, user.organization_id);

    if (parentPhase.is_task) {
      throw new ValidationError('Cannot create tasks under another task');
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = phaseSchema.safeParse({
      ...body,
      project_id: parentPhase.project_id,
      parent_phase_id: phaseId,
      is_task: true,
      // Ensure planned_duration_days has a default value
      planned_duration_days: body.planned_duration_days ?? 1,
    });

    if (!validationResult.success) {
      throw new ValidationError(validationResult.error.issues[0].message);
    }

    // Validate task dates against parent phase
    const dateErrors = validateTaskDates(validationResult.data, parentPhase);
    if (dateErrors.length > 0) {
      throw new ValidationError(dateErrors.join('; '));
    }

    // Create the task
    const task = await createPhase({
      ...validationResult.data,
      planned_duration_days: validationResult.data.planned_duration_days ?? 1
    }, user.organization_id);

    // Recalculate parent phase duration based on all tasks
    try {
      await recalculatePhaseDuration(phaseId, user.organization_id, false);
    } catch (error) {
      // Log error but don't fail the request if recalculation fails
      console.error('Failed to recalculate phase duration:', error);
    }

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
