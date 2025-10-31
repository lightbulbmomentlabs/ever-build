/**
 * Projects API Routes
 *
 * GET  /api/projects - List all projects
 * POST /api/projects - Create a new project
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserByClerkId } from '@/lib/services/user.service';
import { getProjects, createProject } from '@/lib/services/project.service';
import { projectSchema } from '@/lib/validations/project';
import { AuthenticationError, handleApiError, ValidationError } from '@/lib/utils/errors';

/**
 * GET /api/projects
 * Get all projects for the user's organization
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new AuthenticationError();
    }

    // Get user to find organization
    const user = await getUserByClerkId(userId);
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    // Get filters from query params
    const { searchParams } = new URL(req.url);
    const filters = {
      status: searchParams.get('status') as 'not_started' | 'active' | 'on_hold' | 'under_contract' | 'irsa' | 'sold' | 'warranty_period' | 'archived' | undefined,
      search: searchParams.get('search') || undefined,
      start_date: searchParams.get('start_date') || undefined,
      end_date: searchParams.get('end_date') || undefined,
    };

    const projects = await getProjects(user.organization_id, filters);

    return NextResponse.json({ projects }, { status: 200 });
  } catch (error) {
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

/**
 * POST /api/projects
 * Create a new project
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new AuthenticationError();
    }

    // Get user to find organization
    const user = await getUserByClerkId(userId);
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = projectSchema.safeParse(body);

    if (!validationResult.success) {
      throw new ValidationError(validationResult.error.issues[0].message);
    }

    // Create project
    const project = await createProject({
      ...validationResult.data,
      organization_id: user.organization_id,
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
