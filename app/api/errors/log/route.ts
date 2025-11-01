import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabaseClient } from '@/lib/db/supabase-client';

/**
 * POST /api/errors/log
 *
 * Log client-side errors to the database.
 * Can be called by authenticated users or anonymously.
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    // Get request body
    const body = await request.json();
    const {
      error_message,
      error_stack,
      error_type = 'javascript',
      page_url,
      user_action,
      component_name,
      severity = 'error',
    } = body;

    // Validate required fields
    if (!error_message || !page_url) {
      return NextResponse.json(
        { error: 'Missing required fields: error_message and page_url' },
        { status: 400 }
      );
    }

    const supabase = getServerSupabaseClient();

    // Get user details if authenticated
    let user_id = null;
    let clerk_user_id = null;
    let user_email = null;

    if (userId) {
      const { data: user } = await supabase
        .from('users')
        .select('id, clerk_user_id, email')
        .eq('clerk_user_id', userId)
        .single();

      if (user) {
        user_id = user.id;
        clerk_user_id = user.clerk_user_id;
        user_email = user.email;
      }
    }

    // Get request metadata
    const user_agent = request.headers.get('user-agent') || undefined;
    const ip_address = request.headers.get('x-forwarded-for') ||
                       request.headers.get('x-real-ip') ||
                       undefined;

    // Insert error log
    const { error: insertError } = await supabase
      .from('error_logs')
      .insert({
        user_id,
        clerk_user_id,
        user_email,
        error_message,
        error_stack,
        error_type,
        page_url,
        user_action,
        component_name,
        severity,
        user_agent,
        ip_address,
        resolved: false,
      });

    if (insertError) {
      console.error('Failed to insert error log:', insertError);
      throw new Error(`Failed to log error: ${insertError.message}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging error:', error);

    // Don't throw errors for error logging - fail silently
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to log error' },
      { status: 500 }
    );
  }
}
