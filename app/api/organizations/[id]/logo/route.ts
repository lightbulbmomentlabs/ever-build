/**
 * Organization Logo API Routes
 *
 * POST   /api/organizations/[id]/logo - Upload organization logo
 * DELETE /api/organizations/[id]/logo - Delete organization logo
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserByClerkId } from '@/lib/services/user.service';
import {
  uploadOrganizationLogo,
  deleteOrganizationLogo,
  getOrganizationById,
} from '@/lib/services/organization.service';
import {
  AuthenticationError,
  handleApiError,
  ValidationError,
  AuthorizationError,
} from '@/lib/utils/errors';

/**
 * POST /api/organizations/[id]/logo
 * Upload organization logo
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

    // Parse form data
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      throw new ValidationError('No file provided');
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      throw new ValidationError('File size must be less than 5MB');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      throw new ValidationError('File must be an image (JPEG, PNG, WebP, or SVG)');
    }

    // Upload logo
    const logoUrl = await uploadOrganizationLogo(id, file);

    return NextResponse.json({ logo_url: logoUrl }, { status: 200 });
  } catch (error) {
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

/**
 * DELETE /api/organizations/[id]/logo
 * Delete organization logo
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

    // Get organization to get logo URL
    const organization = await getOrganizationById(id);

    if (!organization.logo_url) {
      throw new ValidationError('No logo to delete');
    }

    // Delete logo
    await deleteOrganizationLogo(id, organization.logo_url);

    return NextResponse.json({ message: 'Logo deleted successfully' }, { status: 200 });
  } catch (error) {
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
