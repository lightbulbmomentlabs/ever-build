/**
 * Contacts API Routes
 *
 * GET  /api/contacts - List all contacts
 * POST /api/contacts - Create a new contact
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserByClerkId } from '@/lib/services/user.service';
import { getContacts, createContact } from '@/lib/services/contact.service';
import { contactSchema } from '@/lib/validations/contact';
import { AuthenticationError, handleApiError, ValidationError } from '@/lib/utils/errors';

/**
 * GET /api/contacts
 * Get all contacts for the user's organization
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
      is_active: searchParams.get('is_active') === 'true' ? true :
                 searchParams.get('is_active') === 'false' ? false : undefined,
      search: searchParams.get('search') || undefined,
    };

    const contacts = await getContacts(user.organization_id, filters);

    return NextResponse.json({ contacts }, { status: 200 });
  } catch (error) {
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

/**
 * POST /api/contacts
 * Create a new contact
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
    const validationResult = contactSchema.safeParse(body);

    if (!validationResult.success) {
      throw new ValidationError(validationResult.error.issues[0].message);
    }

    // Create contact
    const contact = await createContact({
      ...validationResult.data,
      organization_id: user.organization_id,
    });

    return NextResponse.json({ contact }, { status: 201 });
  } catch (error) {
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
