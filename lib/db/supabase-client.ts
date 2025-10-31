/**
 * Supabase Client Utilities
 *
 * This file provides Supabase client instances for different contexts:
 * - Browser client: For client-side operations
 * - Server client: For server-side operations with service role key
 */

import { createClient } from '@supabase/supabase-js';

// Type safety: ensure environment variables are set
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

/**
 * Browser Supabase Client
 *
 * Use this client for operations from the browser (client components).
 * This client uses the anon key and respects RLS policies.
 */
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * Server Supabase Client
 *
 * Use this client for server-side operations (API routes, server actions).
 * This client uses the service role key and bypasses RLS policies.
 *
 * ⚠️ IMPORTANT: Only use this on the server. Never expose to the client.
 */
export const getServerSupabaseClient = () => {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};

/**
 * Database Table Types
 *
 * These types match the Supabase schema.
 * TODO: Generate these automatically with Supabase CLI:
 * supabase gen types typescript --local > lib/db/database.types.ts
 */
export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          company_name: string | null;
          address_line1: string | null;
          address_line2: string | null;
          city: string | null;
          state: string | null;
          zip_code: string | null;
          country: string | null;
          logo_url: string | null;
          url_slug: string | null;
          phone: string | null;
          website: string | null;
          stripe_customer_id: string | null;
          subscription_status: 'free' | 'active' | 'past_due' | 'cancelled';
          subscription_tier: 'free' | 'pro' | 'enterprise' | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          company_name?: string | null;
          address_line1?: string | null;
          address_line2?: string | null;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          country?: string | null;
          logo_url?: string | null;
          url_slug?: string | null;
          phone?: string | null;
          website?: string | null;
          stripe_customer_id?: string | null;
          subscription_status?: 'free' | 'active' | 'past_due' | 'cancelled';
          subscription_tier?: 'free' | 'pro' | 'enterprise' | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          company_name?: string | null;
          address_line1?: string | null;
          address_line2?: string | null;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          country?: string | null;
          logo_url?: string | null;
          url_slug?: string | null;
          phone?: string | null;
          website?: string | null;
          stripe_customer_id?: string | null;
          subscription_status?: 'free' | 'active' | 'past_due' | 'cancelled';
          subscription_tier?: 'free' | 'pro' | 'enterprise' | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          organization_id: string;
          clerk_user_id: string;
          email: string;
          full_name: string;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          clerk_user_id: string;
          email: string;
          full_name: string;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          clerk_user_id?: string;
          email?: string;
          full_name?: string;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      contacts: {
        Row: {
          id: string;
          organization_id: string;
          company_name: string;
          contact_person: string;
          trade: string;
          phone_primary: string;
          phone_secondary: string | null;
          email: string | null;
          lead_time_days: number;
          notes: string | null;
          image_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          company_name: string;
          contact_person: string;
          trade: string;
          phone_primary: string;
          phone_secondary?: string | null;
          email?: string | null;
          lead_time_days?: number;
          notes?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          company_name?: string;
          contact_person?: string;
          trade?: string;
          phone_primary?: string;
          phone_secondary?: string | null;
          email?: string | null;
          lead_time_days?: number;
          notes?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          slug: string;
          slug_sequence: number;
          address: string;
          city: string;
          state: string;
          zip_code: string;
          lot_number: string | null;
          model_type: string | null;
          square_footage: number | null;
          status: 'not_started' | 'active' | 'on_hold' | 'under_contract' | 'irsa' | 'sold' | 'warranty_period' | 'archived';
          target_completion_date: string;
          actual_completion_date: string | null;
          notes: string | null;
          baseline_start_date: string | null;
          baseline_duration_days: number | null;
          baseline_set_date: string | null;
          metadata: Record<string, any>;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          slug?: string;
          slug_sequence?: number;
          address: string;
          city: string;
          state: string;
          zip_code: string;
          lot_number?: string | null;
          model_type?: string | null;
          square_footage?: number | null;
          status?: 'not_started' | 'active' | 'on_hold' | 'under_contract' | 'irsa' | 'sold' | 'warranty_period' | 'archived';
          target_completion_date: string;
          actual_completion_date?: string | null;
          notes?: string | null;
          baseline_start_date?: string | null;
          baseline_duration_days?: number | null;
          baseline_set_date?: string | null;
          metadata?: Record<string, any>;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          slug?: string;
          slug_sequence?: number;
          address?: string;
          city?: string;
          state?: string;
          zip_code?: string;
          lot_number?: string | null;
          model_type?: string | null;
          square_footage?: number | null;
          status?: 'not_started' | 'active' | 'on_hold' | 'under_contract' | 'irsa' | 'sold' | 'warranty_period' | 'archived';
          target_completion_date?: string;
          actual_completion_date?: string | null;
          notes?: string | null;
          baseline_start_date?: string | null;
          baseline_duration_days?: number | null;
          baseline_set_date?: string | null;
          metadata?: Record<string, any>;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      phases: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          description: string | null;
          sequence_order: number;
          planned_start_date: string;
          planned_duration_days: number;
          planned_end_date: string;
          actual_start_date: string | null;
          actual_end_date: string | null;
          status: 'not_started' | 'in_progress' | 'completed' | 'delayed' | 'blocked';
          predecessor_phase_id: string | null;
          buffer_days: number;
          color: string | null;
          metadata: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          name: string;
          description?: string | null;
          sequence_order: number;
          planned_start_date: string;
          planned_duration_days: number;
          planned_end_date?: string; // Calculated by trigger
          actual_start_date?: string | null;
          actual_end_date?: string | null;
          status?: 'not_started' | 'in_progress' | 'completed' | 'delayed' | 'blocked';
          predecessor_phase_id?: string | null;
          buffer_days?: number;
          color?: string | null;
          metadata?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          name?: string;
          description?: string | null;
          sequence_order?: number;
          planned_start_date?: string;
          planned_duration_days?: number;
          planned_end_date?: string;
          actual_start_date?: string | null;
          actual_end_date?: string | null;
          status?: 'not_started' | 'in_progress' | 'completed' | 'delayed' | 'blocked';
          predecessor_phase_id?: string | null;
          buffer_days?: number;
          color?: string | null;
          metadata?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
      };
      phase_contacts: {
        Row: {
          id: string;
          phase_id: string;
          contact_id: string;
          role: string | null;
          notification_advance_days: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          phase_id: string;
          contact_id: string;
          role?: string | null;
          notification_advance_days?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          phase_id?: string;
          contact_id?: string;
          role?: string | null;
          notification_advance_days?: number;
          created_at?: string;
        };
      };
      sms_messages: {
        Row: {
          id: string;
          organization_id: string;
          contact_id: string | null;
          project_id: string | null;
          phase_id: string | null;
          to_phone: string;
          message_body: string;
          sent_at: string;
          twilio_sid: string | null;
          status: string;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          contact_id?: string | null;
          project_id?: string | null;
          phase_id?: string | null;
          to_phone: string;
          message_body: string;
          sent_at?: string;
          twilio_sid?: string | null;
          status?: string;
          error_message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          contact_id?: string | null;
          project_id?: string | null;
          phase_id?: string | null;
          to_phone?: string;
          message_body?: string;
          sent_at?: string;
          twilio_sid?: string | null;
          status?: string;
          error_message?: string | null;
          created_at?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          project_id: string;
          phase_id: string | null;
          organization_id: string;
          file_name: string;
          file_path: string;
          file_type: string;
          file_size: number;
          title: string;
          description: string | null;
          category: 'permits' | 'plans_drawings' | 'contracts' | 'invoices' | 'inspections' | 'photos' | 'warranties' | 'schedules' | 'specifications' | 'other';
          visibility: 'internal' | 'shared_with_subs' | 'public';
          uploaded_by: string;
          uploaded_at: string;
          version: number;
          is_active: boolean;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          phase_id?: string | null;
          organization_id: string;
          file_name: string;
          file_path: string;
          file_type: string;
          file_size: number;
          title: string;
          description?: string | null;
          category: 'permits' | 'plans_drawings' | 'contracts' | 'invoices' | 'inspections' | 'photos' | 'warranties' | 'schedules' | 'specifications' | 'other';
          visibility?: 'internal' | 'shared_with_subs' | 'public';
          uploaded_by: string;
          uploaded_at?: string;
          version?: number;
          is_active?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          phase_id?: string | null;
          organization_id?: string;
          file_name?: string;
          file_path?: string;
          file_type?: string;
          file_size?: number;
          title?: string;
          description?: string | null;
          category?: 'permits' | 'plans_drawings' | 'contracts' | 'invoices' | 'inspections' | 'photos' | 'warranties' | 'schedules' | 'specifications' | 'other';
          visibility?: 'internal' | 'shared_with_subs' | 'public';
          uploaded_by?: string;
          uploaded_at?: string;
          version?: number;
          is_active?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
