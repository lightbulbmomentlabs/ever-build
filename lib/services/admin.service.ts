/**
 * Admin Service
 *
 * Business logic for administrative functions.
 * Handles user management, activity tracking, and admin-only operations.
 */

import { getServerSupabaseClient } from '@/lib/db/supabase-client';
import { NotFoundError, AuthorizationError } from '@/lib/utils/errors';
import type { Database } from '@/lib/db/supabase-client';

type User = Database['public']['Tables']['users']['Row'];

// Types will be available after migrations are applied
type ErrorLog = {
  id: string;
  user_id?: string | null;
  clerk_user_id?: string | null;
  user_email?: string | null;
  error_message: string;
  error_stack?: string | null;
  error_type: string;
  page_url: string;
  user_action?: string | null;
  component_name?: string | null;
  severity: 'warning' | 'error' | 'critical';
  resolved: boolean;
  resolved_at?: string | null;
  resolved_by?: string | null;
  resolution_notes?: string | null;
  user_agent?: string | null;
  ip_address?: string | null;
  created_at: string;
  updated_at: string;
};

type AdminActivityLog = {
  id: string;
  admin_user_id: string;
  admin_email: string;
  action: string;
  target_user_id?: string | null;
  target_user_email?: string | null;
  target_organization_id?: string | null;
  details?: any;
  description?: string | null;
  created_at: string;
};

/**
 * User with organization details
 */
export type UserWithOrganization = User & {
  organization: {
    id: string;
    name: string;
    created_at: string;
  };
};

/**
 * User activity metrics
 */
export interface UserActivityMetrics {
  projects_count: number;
  phases_count: number;
  tasks_count: number;
  contacts_count: number;
  documents_count: number;
  last_active: string | null;
}

/**
 * Dashboard statistics
 */
export interface AdminDashboardStats {
  total_users: number;
  active_users_30d: number;
  total_organizations: number;
  total_projects: number;
  unresolved_errors: number;
  signups_last_30d: number[];
}

/**
 * Check if user is an admin
 */
export async function isUserAdmin(clerkUserId: string): Promise<boolean> {
  const supabase = getServerSupabaseClient();

  const { data, error } = await supabase
    .from('users')
    .select('is_admin')
    .eq('clerk_user_id', clerkUserId)
    .single();

  if (error || !data) {
    return false;
  }

  return data.is_admin || false;
}

/**
 * Require admin access (throws if not admin)
 */
export async function requireAdmin(clerkUserId: string): Promise<void> {
  const isAdmin = await isUserAdmin(clerkUserId);
  if (!isAdmin) {
    throw new AuthorizationError('Admin access required');
  }
}

/**
 * Get all users with their organization details
 */
export async function getAllUsers(): Promise<UserWithOrganization[]> {
  const supabase = getServerSupabaseClient();

  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      organization:organizations(id, name, created_at)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to get users: ${error.message}`);
  }

  return data as UserWithOrganization[];
}

/**
 * Get user activity metrics
 */
export async function getUserActivityMetrics(userId: string): Promise<UserActivityMetrics> {
  const supabase = getServerSupabaseClient();

  // Get user's organization
  const { data: user } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', userId)
    .single();

  if (!user) {
    throw new NotFoundError('User');
  }

  // Count projects
  const { count: projects_count } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', user.organization_id);

  // Count phases
  const { count: phases_count } = await supabase
    .from('phases')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', user.organization_id);

  // Count tasks
  const { count: tasks_count } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', user.organization_id);

  // Count contacts
  const { count: contacts_count } = await supabase
    .from('contacts')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', user.organization_id);

  // Count documents
  const { count: documents_count } = await supabase
    .from('documents')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', user.organization_id);

  return {
    projects_count: projects_count || 0,
    phases_count: phases_count || 0,
    tasks_count: tasks_count || 0,
    contacts_count: contacts_count || 0,
    documents_count: documents_count || 0,
    last_active: null, // Could be enhanced with last login tracking
  };
}

/**
 * Delete user and all associated data (cascade delete)
 */
export async function deleteUserAndData(
  userId: string,
  adminUserId: string,
  adminEmail: string
): Promise<void> {
  const supabase = getServerSupabaseClient();

  // Get user details before deletion
  const { data: user } = await supabase
    .from('users')
    .select('*, organization:organizations(id, name)')
    .eq('id', userId)
    .single();

  if (!user) {
    throw new NotFoundError('User');
  }

  // Check if user is the only member of their organization
  const { data: orgUsers } = await supabase
    .from('users')
    .select('id')
    .eq('organization_id', user.organization_id);

  const isOnlyMember = orgUsers && orgUsers.length === 1;

  // Delete user (CASCADE will handle related data due to foreign key constraints)
  const { error: deleteError } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);

  if (deleteError) {
    throw new Error(`Failed to delete user: ${deleteError.message}`);
  }

  // If user was the only member, organization will be auto-deleted by CASCADE
  // Log the admin action
  await logAdminActivity({
    admin_user_id: adminUserId,
    admin_email: adminEmail,
    action: 'user_deleted',
    target_user_id: userId,
    target_user_email: user.email,
    target_organization_id: user.organization_id,
    description: `Deleted user ${user.email} and ${isOnlyMember ? 'their organization' : 'removed from organization'}`,
    details: {
      deleted_organization: isOnlyMember,
      organization_name: user.organization?.name,
    },
  });
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(): Promise<AdminDashboardStats> {
  const supabase = getServerSupabaseClient();

  // Total users
  const { count: total_users } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });

  // Active users (created in last 30 days - could be enhanced with last_login tracking)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { count: active_users_30d } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', thirtyDaysAgo.toISOString());

  // Total organizations
  const { count: total_organizations } = await supabase
    .from('organizations')
    .select('*', { count: 'exact', head: true });

  // Total projects
  const { count: total_projects } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true });

  // Unresolved errors
  const { count: unresolved_errors } = await supabase
    .from('error_logs')
    .select('*', { count: 'exact', head: true })
    .eq('resolved', false);

  // Signups last 30 days (array of daily counts)
  const { data: signupData } = await supabase
    .from('users')
    .select('created_at')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: true });

  // Group by day
  const signups_last_30d = Array(30).fill(0);
  signupData?.forEach((user) => {
    const daysDiff = Math.floor(
      (new Date().getTime() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysDiff >= 0 && daysDiff < 30) {
      signups_last_30d[29 - daysDiff]++;
    }
  });

  return {
    total_users: total_users || 0,
    active_users_30d: active_users_30d || 0,
    total_organizations: total_organizations || 0,
    total_projects: total_projects || 0,
    unresolved_errors: unresolved_errors || 0,
    signups_last_30d,
  };
}

/**
 * Log admin activity
 */
export async function logAdminActivity(data: {
  admin_user_id: string;
  admin_email: string;
  action: string;
  target_user_id?: string;
  target_user_email?: string;
  target_organization_id?: string;
  description: string;
  details?: any;
}): Promise<AdminActivityLog> {
  const supabase = getServerSupabaseClient();

  const { data: log, error } = await supabase
    .from('admin_activity_log')
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error('Failed to log admin activity:', error);
    throw new Error(`Failed to log admin activity: ${error.message}`);
  }

  return log;
}

/**
 * Get error logs with filters
 */
export async function getErrorLogs(filters?: {
  severity?: string;
  resolved?: boolean;
  user_id?: string;
  limit?: number;
}): Promise<ErrorLog[]> {
  const supabase = getServerSupabaseClient();

  let query = supabase
    .from('error_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.severity) {
    query = query.eq('severity', filters.severity);
  }

  if (filters?.resolved !== undefined) {
    query = query.eq('resolved', filters.resolved);
  }

  if (filters?.user_id) {
    query = query.eq('user_id', filters.user_id);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to get error logs: ${error.message}`);
  }

  return data || [];
}

/**
 * Mark error as resolved
 */
export async function resolveError(
  errorId: string,
  adminUserId: string,
  resolutionNotes?: string
): Promise<void> {
  const supabase = getServerSupabaseClient();

  const { error } = await supabase
    .from('error_logs')
    .update({
      resolved: true,
      resolved_at: new Date().toISOString(),
      resolved_by: adminUserId,
      resolution_notes: resolutionNotes,
    })
    .eq('id', errorId);

  if (error) {
    throw new Error(`Failed to resolve error: ${error.message}`);
  }
}

/**
 * Get admin activity logs with filters
 */
export async function getAdminActivityLogs(filters?: {
  admin_user_id?: string;
  action?: string;
  limit?: number;
}): Promise<AdminActivityLog[]> {
  const supabase = getServerSupabaseClient();

  let query = supabase
    .from('admin_activity_log')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.admin_user_id) {
    query = query.eq('admin_user_id', filters.admin_user_id);
  }

  if (filters?.action) {
    query = query.eq('action', filters.action);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to get admin activity logs: ${error.message}`);
  }

  return data || [];
}
