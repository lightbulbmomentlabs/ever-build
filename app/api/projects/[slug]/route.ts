/**
 * Single Project API Routes
 *
 * GET    /api/projects/[slug] - Get a project by slug
 * PATCH  /api/projects/[slug] - Update a project
 * DELETE /api/projects/[slug] - Delete a project
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserByClerkId } from '@/lib/services/user.service';
import {
  getProjectBySlug,
  updateProject,
  deleteProject,
} from '@/lib/services/project.service';
import { projectSchema } from '@/lib/validations/project';
import { AuthenticationError, handleApiError, ValidationError } from '@/lib/utils/errors';

/**
 * GET /api/projects/[slug]
 * Get a single project with its phases by slug
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

    const { slug } = await params;
    const project = await getProjectBySlug(slug, user.organization_id);

    return NextResponse.json({ project }, { status: 200 });
  } catch (error) {
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

/**
 * PATCH /api/projects/[slug]
 * Update a project by slug
 */
export async function PATCH(
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

    // Parse and validate request body
    const body = await req.json();
    const validationResult = projectSchema.partial().safeParse(body);

    if (!validationResult.success) {
      throw new ValidationError(validationResult.error.issues[0].message);
    }

    // Get project by slug to get its ID
    const { slug } = await params;
    const project = await getProjectBySlug(slug, user.organization_id);

    // Update using project ID
    const updatedProject = await updateProject(
      project.id,
      user.organization_id,
      validationResult.data
    );

    return NextResponse.json({ project: updatedProject }, { status: 200 });
  } catch (error) {
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

/**
 * DELETE /api/projects/[slug]
 * Delete a project from the database
 */
export async function DELETE(
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

    // Delete using project ID
    await deleteProject(project.id, user.organization_id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
