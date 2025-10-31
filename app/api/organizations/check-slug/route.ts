/**
 * Organization URL Slug Check API Route
 *
 * GET /api/organizations/check-slug?slug=example&exclude_id=uuid
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { checkUrlSlugAvailability } from '@/lib/services/organization.service';
import { urlSlugCheckSchema } from '@/lib/validations/organization';
import {
  AuthenticationError,
  handleApiError,
  ValidationError,
} from '@/lib/utils/errors';

/**
 * GET /api/organizations/check-slug
 * Check if a URL slug is available
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new AuthenticationError();
    }

    // Get query params
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    const excludeId = searchParams.get('exclude_id') || undefined;

    if (!slug) {
      throw new ValidationError('Slug parameter is required');
    }

    // Validate slug format
    const validationResult = urlSlugCheckSchema.safeParse({
      slug,
      exclude_organization_id: excludeId,
    });

    if (!validationResult.success) {
      throw new ValidationError(validationResult.error.issues[0].message);
    }

    // Check availability
    const isAvailable = await checkUrlSlugAvailability(slug, excludeId);

    return NextResponse.json({ available: isAvailable }, { status: 200 });
  } catch (error) {
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
