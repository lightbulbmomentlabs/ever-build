import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient, WaitlistLead } from '@/lib/supabase';
import { syncLeadToHubSpot } from '@/lib/hubspot';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { name, email, company, projectCount, phone, interestedInCall } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createSupabaseClient();

    // Prepare lead data
    const leadData: WaitlistLead = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      company: company?.trim() || null,
      project_count: projectCount || null,
      phone: phone?.trim() || null,
      interested_in_call: interestedInCall || false,
      lead_status: 'new',
      lead_source: 'website_waitlist',
    };

    // Insert into Supabase
    const { data, error } = await supabase
      .from('waitlist_leads')
      .insert([leadData])
      .select()
      .single();

    if (error) {
      // Handle duplicate email error
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'This email is already on the waitlist' },
          { status: 409 }
        );
      }

      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to save lead to database' },
        { status: 500 }
      );
    }

    // Sync to HubSpot (non-blocking - don't fail if this fails)
    syncLeadToHubSpot({
      name: data.name,
      email: data.email,
      company: data.company,
      project_count: data.project_count,
      phone: data.phone,
      interested_in_call: data.interested_in_call,
    }).catch((error) => {
      // Log but don't throw - HubSpot sync is optional
      console.error('HubSpot sync failed (non-critical):', error);
    });

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Successfully added to waitlist',
        lead: {
          id: data.id,
          email: data.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
