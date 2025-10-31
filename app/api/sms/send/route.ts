import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserByClerkId } from '@/lib/services/user.service';
import { sendSMS } from '@/lib/services/sms.service';
import { z } from 'zod';

// Validation schema
const sendSMSSchema = z.object({
  contactId: z.string().uuid(),
  toPhone: z.string().min(10),
  messageBody: z.string().min(1).max(1600), // Allow up to ~10 SMS segments
  projectId: z.string().uuid().optional(),
  phaseId: z.string().uuid().optional(),
});

/**
 * POST /api/sms/send
 *
 * Send an SMS message to a contact
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user and organization
    const user = await getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = sendSMSSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { contactId, toPhone, messageBody, projectId, phaseId } =
      validationResult.data;

    // Send SMS
    const message = await sendSMS({
      organizationId: user.organization_id,
      contactId,
      toPhone,
      messageBody,
      projectId,
      phaseId,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'SMS sent successfully',
        data: message,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error sending SMS:', error);

    // Return user-friendly error message
    const errorMessage =
      error.message || 'Failed to send SMS. Please try again.';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
