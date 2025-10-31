/**
 * Individual Document API Routes
 *
 * GET    /api/projects/[slug]/documents/[documentId] - Get a specific document
 * PATCH  /api/projects/[slug]/documents/[documentId] - Update document metadata
 * DELETE /api/projects/[slug]/documents/[documentId] - Delete a document
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserByClerkId } from '@/lib/services/user.service';
import {
  getDocumentById,
  updateDocument,
  deleteDocument,
  getDocumentDownloadUrl,
} from '@/lib/services/document.service';
import { documentUpdateSchema } from '@/lib/validations/document';
import {
  AuthenticationError,
  handleApiError,
  ValidationError,
} from '@/lib/utils/errors';

/**
 * GET /api/projects/[slug]/documents/[documentId]
 * Get a specific document with optional download URL
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; documentId: string }> }
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

    const { documentId } = await params;

    const document = await getDocumentById(documentId, user.organization_id);

    // Check if download URL is requested
    const searchParams = req.nextUrl.searchParams;
    const includeDownloadUrl = searchParams.get('download') === 'true';

    let downloadUrl: string | undefined;
    if (includeDownloadUrl) {
      downloadUrl = await getDocumentDownloadUrl(
        documentId,
        user.organization_id
      );
    }

    return NextResponse.json(
      {
        document,
        ...(downloadUrl && { downloadUrl }),
      },
      { status: 200 }
    );
  } catch (error) {
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

/**
 * PATCH /api/projects/[slug]/documents/[documentId]
 * Update document metadata (not the file itself)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; documentId: string }> }
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

    const { documentId } = await params;

    // Parse and validate request body
    const body = await req.json();
    const validationResult = documentUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      throw new ValidationError(validationResult.error.issues[0].message);
    }

    const document = await updateDocument(
      documentId,
      validationResult.data,
      user.organization_id
    );

    return NextResponse.json({ document }, { status: 200 });
  } catch (error) {
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

/**
 * DELETE /api/projects/[slug]/documents/[documentId]
 * Soft delete a document
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; documentId: string }> }
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

    const { documentId } = await params;

    await deleteDocument(documentId, user.organization_id);

    return NextResponse.json(
      { message: 'Document deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
