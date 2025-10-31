/**
 * Single Phase API Routes
 *
 * GET    /api/phases/[id] - Get a phase by ID
 * PATCH  /api/phases/[id] - Update a phase
 * DELETE /api/phases/[id] - Delete a phase
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserByClerkId } from '@/lib/services/user.service';
import {
  getPhaseById,
  updatePhase,
  deletePhase,
  recalculatePhaseDuration,
  validateTaskDates,
} from '@/lib/services/phase.service';
import { phaseSchema, phaseUpdateSchema } from '@/lib/validations/phase';
import { AuthenticationError, handleApiError, ValidationError } from '@/lib/utils/errors';

/**
 * GET /api/phases/[id]
 * Get a single phase with its contacts
 */
export async function GET(
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
    const phase = await getPhaseById(id, user.organization_id);

    return NextResponse.json({ phase }, { status: 200 });
  } catch (error) {
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

/**
 * PATCH /api/phases/[id]
 * Update a phase or task
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

    const { id } = await params;

    // Get current phase/task data
    const currentPhase = await getPhaseById(id, user.organization_id);

    // Parse and validate request body
    const body = await req.json();
    // Use phaseUpdateSchema which has no defaults to prevent overwriting fields
    const validationResult = phaseUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      throw new ValidationError(validationResult.error.issues[0].message);
    }

    // If this is a task being updated, validate dates and trigger parent recalculation
    if (currentPhase.is_task && currentPhase.parent_phase_id) {
      // Check if dates are being updated
      const updatingDates =
        validationResult.data.planned_start_date !== undefined ||
        validationResult.data.planned_duration_days !== undefined ||
        validationResult.data.buffer_days !== undefined;

      if (updatingDates) {
        // Get parent phase for validation
        const parentPhase = await getPhaseById(
          currentPhase.parent_phase_id,
          user.organization_id
        );

        // Validate task dates against parent phase
        const dateErrors = validateTaskDates(
          { ...currentPhase, ...validationResult.data },
          parentPhase
        );
        if (dateErrors.length > 0) {
          throw new ValidationError(dateErrors.join('; '));
        }
      }

      // Update the task
      const phase = await updatePhase(id, user.organization_id, validationResult.data);

      // Recalculate parent phase duration if dates were updated
      if (updatingDates) {
        try {
          await recalculatePhaseDuration(
            currentPhase.parent_phase_id,
            user.organization_id,
            false
          );
        } catch (error) {
          console.error('Failed to recalculate phase duration:', error);
        }
      }

      return NextResponse.json({ phase }, { status: 200 });
    }

    // If manually updating phase duration, mark as override
    if (
      validationResult.data.planned_duration_days !== undefined ||
      validationResult.data.buffer_days !== undefined
    ) {
      const metadata = (currentPhase.metadata as any) || {};
      if (metadata.duration_mode === 'auto') {
        validationResult.data.metadata = {
          ...metadata,
          duration_mode: 'override',
        };
      }
    }

    // Update the phase
    const phase = await updatePhase(id, user.organization_id, validationResult.data);

    return NextResponse.json({ phase }, { status: 200 });
  } catch (error) {
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

/**
 * DELETE /api/phases/[id]
 * Delete a phase or task
 */
export async function DELETE(
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

    // Get phase/task data before deletion to check if it's a task
    const currentPhase = await getPhaseById(id, user.organization_id);
    const parentPhaseId = currentPhase.is_task ? currentPhase.parent_phase_id : null;

    // Delete the phase/task
    await deletePhase(id, user.organization_id);

    // If this was a task, recalculate parent phase duration
    if (parentPhaseId) {
      try {
        await recalculatePhaseDuration(parentPhaseId, user.organization_id, false);
      } catch (error) {
        console.error('Failed to recalculate phase duration:', error);
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
