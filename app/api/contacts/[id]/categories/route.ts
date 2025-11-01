import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getServerSupabaseClient } from '@/lib/db/supabase-client';
import { getUserByClerkId } from '@/lib/services/user.service';

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * GET /api/contacts/:id/categories
 *
 * Returns all category assignments for a specific contact
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id: contactId } = await params;
    const supabase = getServerSupabaseClient();

    // Fetch category assignments with category and sub-type details
    const { data: assignments, error } = await supabase
      .from('contact_category_assignments')
      .select(`
        id,
        category:contact_categories(
          id,
          name
        ),
        sub_type:contact_sub_types(
          id,
          name
        ),
        created_at
      `)
      .eq('contact_id', contactId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching category assignments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch category assignments' },
        { status: 500 }
      );
    }

    return NextResponse.json(assignments || []);
  } catch (error) {
    console.error('Unexpected error in GET /api/contacts/:id/categories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/contacts/:id/categories
 *
 * Assigns a category/sub-type to a contact
 *
 * Request body:
 * {
 *   category_id: string,
 *   sub_type_id: string
 * }
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id: contactId } = await params;
    const body = await request.json();
    const { category_id, sub_type_id } = body;

    // Validate required fields (only category_id is required, sub_type_id is optional)
    if (!category_id) {
      return NextResponse.json(
        { error: 'category_id is required' },
        { status: 400 }
      );
    }

    const supabase = getServerSupabaseClient();

    // Verify contact belongs to user's organization
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .select('id, organization_id')
      .eq('id', contactId)
      .eq('organization_id', user.organization_id)
      .single();

    if (contactError || !contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    // Create category assignment
    const { data: assignment, error: assignmentError } = await supabase
      .from('contact_category_assignments')
      .insert({
        contact_id: contactId,
        category_id,
        sub_type_id: sub_type_id || null,
      })
      .select(`
        id,
        category:contact_categories(
          id,
          name
        ),
        sub_type:contact_sub_types(
          id,
          name
        ),
        created_at
      `)
      .single();

    if (assignmentError) {
      // Check if it's a duplicate assignment error
      if (assignmentError.code === '23505') {
        return NextResponse.json(
          { error: 'This category is already assigned to the contact' },
          { status: 409 }
        );
      }

      console.error('Error creating category assignment:', assignmentError);
      return NextResponse.json(
        { error: 'Failed to assign category' },
        { status: 500 }
      );
    }

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/contacts/:id/categories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/contacts/:id/categories/:assignmentId
 *
 * Removes a category assignment from a contact
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserByClerkId(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id: contactId } = await params;
    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get('assignmentId');

    if (!assignmentId) {
      return NextResponse.json(
        { error: 'assignmentId is required' },
        { status: 400 }
      );
    }

    const supabase = getServerSupabaseClient();

    // Verify the assignment belongs to a contact in the user's organization
    const { data: assignment, error: fetchError } = await supabase
      .from('contact_category_assignments')
      .select(`
        id,
        contact:contacts!inner(
          id,
          organization_id
        )
      `)
      .eq('id', assignmentId)
      .eq('contact_id', contactId)
      .single();

    if (fetchError || !assignment) {
      return NextResponse.json(
        { error: 'Category assignment not found' },
        { status: 404 }
      );
    }

    if ((assignment.contact as any).organization_id !== user.organization_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete the assignment
    const { error: deleteError } = await supabase
      .from('contact_category_assignments')
      .delete()
      .eq('id', assignmentId);

    if (deleteError) {
      console.error('Error deleting category assignment:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete category assignment' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/contacts/:id/categories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
