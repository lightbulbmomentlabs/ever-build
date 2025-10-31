/**
 * Organization API Routes
 *
 * GET   /api/organizations/[id] - Get organization details
 * PATCH /api/organizations/[id] - Update organization profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserByClerkId } from '@/lib/services/user.service';
import {
  getOrganizationById,
  updateOrganization,
} from '@/lib/services/organization.service';
import { organizationProfileSchema } from '@/lib/validations/organization';
import {
  AuthenticationError,
  handleApiError,
  ValidationError,
  AuthorizationError,
} from '@/lib/utils/errors';

/**
 * GET /api/organizations/[id]
 * Get organization details
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

    // Get user to verify organization access
    const user = await getUserByClerkId(userId);
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    const { id } = await params;

    // Verify user belongs to this organization
    if (user.organization_id !== id) {
      throw new AuthorizationError('Access denied to this organization');
    }

    const organization = await getOrganizationById(id);

    return NextResponse.json({ organization }, { status: 200 });
  } catch (error) {
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

/**
 * PATCH /api/organizations/[id]
 * Update organization profile
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

    // Get user to verify organization access
    const user = await getUserByClerkId(userId);
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    const { id } = await params;

    // Verify user belongs to this organization
    if (user.organization_id !== id) {
      throw new AuthorizationError('Access denied to this organization');
    }

    // Parse and validate request body
    const body = await req.json();
    const validationResult = organizationProfileSchema.safeParse(body);

    if (!validationResult.success) {
      throw new ValidationError(validationResult.error.issues[0].message);
    }

    // Update organization
    const organization = await updateOrganization(id, validationResult.data);

    return NextResponse.json({ organization }, { status: 200 });
  } catch (error) {
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
