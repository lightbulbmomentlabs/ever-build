import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getServerSupabaseClient } from '@/lib/db/supabase-client';

/**
 * GET /api/contacts/categories
 *
 * Returns all contact categories with their sub-types
 * This endpoint is used to populate category dropdowns in the contact form
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getServerSupabaseClient();

    // Fetch all categories with their sub-types
    const { data: categories, error: categoriesError } = await supabase
      .from('contact_categories')
      .select(`
        id,
        name,
        description,
        sort_order,
        sub_types:contact_sub_types(
          id,
          name,
          description,
          sort_order
        )
      `)
      .order('sort_order', { ascending: true });

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
      return NextResponse.json(
        { error: 'Failed to fetch categories' },
        { status: 500 }
      );
    }

    // Sort sub-types within each category
    const sortedCategories = categories?.map((category) => ({
      ...category,
      sub_types: category.sub_types?.sort(
        (a: any, b: any) => a.sort_order - b.sort_order
      ) || [],
    }));

    return NextResponse.json(sortedCategories || []);
  } catch (error) {
    console.error('Unexpected error in GET /api/contacts/categories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
