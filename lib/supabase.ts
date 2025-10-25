import { createClient } from '@supabase/supabase-js';

// Supabase client for server-side operations (API routes)
export function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

// Database types for waitlist_leads table
export interface WaitlistLead {
  id?: string;
  created_at?: string;
  updated_at?: string;
  name: string;
  email: string;
  company?: string | null;
  project_count?: string | null;
  phone?: string | null;
  interested_in_call: boolean;
  lead_status?: string;
  lead_source?: string;
  notes?: string | null;
  contacted_at?: string | null;
}
