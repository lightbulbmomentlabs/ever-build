/**
 * Project Documents API Routes
 *
 * GET  /api/projects/[slug]/documents - List all documents for a project
 * POST /api/projects/[slug]/documents - Upload a new document
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserByClerkId } from '@/lib/services/user.service';
import { getProjectBySlug } from '@/lib/services/project.service';
import {
  getDocumentsByProject,
  uploadFileToStorage,
  createDocument,
} from '@/lib/services/document.service';
import {
  documentCreateSchema,
  documentFilterSchema,
  MAX_FILE_SIZE,
  allowedFileTypes,
} from '@/lib/validations/document';
import {
  AuthenticationError,
  handleApiError,
  ValidationError,
} from '@/lib/utils/errors';

/**
 * GET /api/projects/[slug]/documents
 * Get all documents for a project with optional filters
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
    const projectId = project.id;

    // Parse query parameters for filters
    const searchParams = req.nextUrl.searchParams;
    const filters = {
      category: searchParams.get('category') || undefined,
      visibility: searchParams.get('visibility') || undefined,
      phase_id: searchParams.get('phase_id') || undefined,
      search: searchParams.get('search') || undefined,
    };

    // Validate filters
    const validationResult = documentFilterSchema.safeParse(filters);
    if (!validationResult.success) {
      throw new ValidationError(validationResult.error.issues[0].message);
    }

    const documents = await getDocumentsByProject(
      projectId,
      user.organization_id,
      validationResult.data
    );

    return NextResponse.json({ documents }, { status: 200 });
  } catch (error) {
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

/**
 * POST /api/projects/[slug]/documents
 * Upload a new document
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
    const projectId = project.id;

    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string | null;
    const category = formData.get('category') as string;
    const visibility = formData.get('visibility') as string | undefined;
    const phaseId = formData.get('phase_id') as string | null;

    if (!file) {
      throw new ValidationError('No file provided');
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new ValidationError('File size must not exceed 25MB');
    }

    // Validate file type
    if (!allowedFileTypes.includes(file.type)) {
      throw new ValidationError(`File type ${file.type} is not supported`);
    }

    // Prepare document data for validation
    const documentData = {
      project_id: projectId,
      phase_id: phaseId || undefined,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      title,
      description: description || undefined,
      category,
      visibility: visibility || 'internal',
    };

    // Validate document data
    const validationResult = documentCreateSchema.safeParse(documentData);
    if (!validationResult.success) {
      throw new ValidationError(validationResult.error.issues[0].message);
    }

    // Upload file to storage
    const { path: filePath } = await uploadFileToStorage(
      file,
      projectId,
      user.organization_id
    );

    // Create document record in database
    const document = await createDocument(
      validationResult.data,
      filePath,
      user.organization_id,
      user.id
    );

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
