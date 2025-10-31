/**
 * Contact Image API Routes
 *
 * POST   /api/contacts/[id]/image - Upload contact image
 * DELETE /api/contacts/[id]/image - Delete contact image
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserByClerkId } from '@/lib/services/user.service';
import {
  uploadContactImage,
  deleteContactImage,
  getContactById,
} from '@/lib/services/contact.service';
import {
  AuthenticationError,
  handleApiError,
  ValidationError,
  AuthorizationError,
} from '@/lib/utils/errors';

/**
 * POST /api/contacts/[id]/image
 * Upload contact image
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

    // Get contact to verify it belongs to user's organization
    const contact = await getContactById(id, user.organization_id);
    if (!contact) {
      throw new AuthorizationError('Contact not found or access denied');
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

    // Upload image
    const imageUrl = await uploadContactImage(id, user.organization_id, file);

    return NextResponse.json({ image_url: imageUrl }, { status: 200 });
  } catch (error) {
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

/**
 * DELETE /api/contacts/[id]/image
 * Delete contact image
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

    // Get contact to verify it belongs to user's organization
    const contact = await getContactById(id, user.organization_id);
    if (!contact) {
      throw new AuthorizationError('Contact not found or access denied');
    }

    if (!contact.image_url) {
      throw new ValidationError('No image to delete');
    }

    // Delete image
    await deleteContactImage(id, user.organization_id, contact.image_url);

    return NextResponse.json({ message: 'Image deleted successfully' }, { status: 200 });
  } catch (error) {
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
