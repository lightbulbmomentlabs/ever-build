/**
 * Project Phases API Routes
 *
 * GET  /api/projects/[slug]/phases - List all phases for a project
 * POST /api/projects/[slug]/phases - Create a new phase
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserByClerkId } from '@/lib/services/user.service';
import { getProjectBySlug } from '@/lib/services/project.service';
import { getPhasesWithTasks, createPhase } from '@/lib/services/phase.service';
import { phaseSchema } from '@/lib/validations/phase';
import { AuthenticationError, handleApiError, ValidationError } from '@/lib/utils/errors';

/**
 * GET /api/projects/[slug]/phases
 * Get all phases with tasks for a project (hierarchical structure)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
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

    // Get project by slug to get its ID
    const { slug } = await params;
    const project = await getProjectBySlug(slug, user.organization_id);
    const phases = await getPhasesWithTasks(project.id, user.organization_id);

    return NextResponse.json({ phases }, { status: 200 });
  } catch (error) {
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

/**
 * POST /api/projects/[slug]/phases
 * Create a new phase
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
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

    // Get project by slug to get its ID
    const { slug } = await params;
    const project = await getProjectBySlug(slug, user.organization_id);

    // Parse and validate request body
    const body = await req.json();
    const validationResult = phaseSchema.safeParse({
      ...body,
      project_id: project.id,
    });

    if (!validationResult.success) {
      throw new ValidationError(validationResult.error.issues[0].message);
    }

    const phase = await createPhase({
      ...validationResult.data,
      planned_duration_days: validationResult.data.planned_duration_days ?? 1
    }, user.organization_id);

    return NextResponse.json({ phase }, { status: 201 });
  } catch (error) {
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
