/**
 * Phase Contacts API Routes
 *
 * POST /api/phases/[id]/contacts - Assign a contact to a phase
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserByClerkId } from '@/lib/services/user.service';
import { assignContactToPhase } from '@/lib/services/phase.service';
import { phaseContactSchema } from '@/lib/validations/phase';
import { AuthenticationError, handleApiError, ValidationError } from '@/lib/utils/errors';

/**
 * POST /api/phases/[id]/contacts
 * Assign a contact to a phase
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

    // Parse and validate request body
    const body = await req.json();
    const validationResult = phaseContactSchema.safeParse({
      ...body,
      phase_id: phaseId,
    });

    if (!validationResult.success) {
      throw new ValidationError(validationResult.error.issues[0].message);
    }

    const assignment = await assignContactToPhase(
      validationResult.data,
      user.organization_id
    );

    return NextResponse.json({ assignment }, { status: 201 });
  } catch (error) {
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
