/**
 * Project Service
 *
 * Business logic for managing projects and their phases.
 */

import { getServerSupabaseClient } from '@/lib/db/supabase-client';
import { NotFoundError } from '@/lib/utils/errors';
import type { Database } from '@/lib/db/supabase-client';
import { getPhasesWithTasks, type PhaseWithTasks } from './phase.service';

type Project = Database['public']['Tables']['projects']['Row'];
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

/**
 * Project with phases included
 */
export type ProjectWithPhases = Project & {
  phases: PhaseWithTasks[];
};

/**
 * Get all projects for an organization
 */
export async function getProjects(
  organizationId: string,
  filters?: {
    status?: 'not_started' | 'active' | 'on_hold' | 'under_contract' | 'irsa' | 'sold' | 'warranty_period' | 'archived';
    search?: string;
    start_date?: string;
    end_date?: string;
  }
): Promise<Project[]> {
  const supabase = getServerSupabaseClient();

  let query = supabase
    .from('projects')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  // Apply filters
  if (filters?.status) {
    query = query.eq('status', filters.status);
  } else {
    // Default to excluding archived projects unless explicitly filtering
    query = query.neq('status', 'archived');
  }

  if (filters?.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,address.ilike.%${filters.search}%,city.ilike.%${filters.search}%`
    );
  }

  if (filters?.start_date) {
    query = query.gte('target_completion_date', filters.start_date);
  }

  if (filters?.end_date) {
    query = query.lte('target_completion_date', filters.end_date);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to get projects: ${error.message}`);
  }

  return data || [];
}

/**
 * Get all projects for an organization with their phases
 */
export async function getProjectsWithPhases(
  organizationId: string,
  filters?: {
    status?: 'not_started' | 'active' | 'on_hold' | 'under_contract' | 'irsa' | 'sold' | 'warranty_period' | 'archived';
    search?: string;
    start_date?: string;
    end_date?: string;
  }
): Promise<ProjectWithPhases[]> {
  // Get all projects
  const projects = await getProjects(organizationId, filters);

  // Fetch phases for each project
  const projectsWithPhases = await Promise.all(
    projects.map(async (project) => {
      const phases = await getPhasesWithTasks(project.id, organizationId);
      return {
        ...project,
        phases,
      };
    })
  );

  return projectsWithPhases;
}

/**
 * Get a single project by ID with its phases
 */
export async function getProjectById(
  projectId: string,
  organizationId: string
): Promise<ProjectWithPhases> {
  const supabase = getServerSupabaseClient();

  // Get project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .eq('organization_id', organizationId)
    .single();

  if (projectError || !project) {
    throw new NotFoundError('Project');
  }

  // Get phases with hierarchical structure using the phase service
  const phases = await getPhasesWithTasks(projectId, organizationId);

  return {
    ...project,
    phases,
  };
}

/**
 * Get a single project by slug with its phases
 */
export async function getProjectBySlug(
  slug: string,
  organizationId: string
): Promise<ProjectWithPhases> {
  const supabase = getServerSupabaseClient();

  // Get project by slug
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .eq('organization_id', organizationId)
    .single();

  if (projectError || !project) {
    throw new NotFoundError('Project');
  }

  // Get phases with hierarchical structure using the phase service
  const phases = await getPhasesWithTasks(project.id, organizationId);

  return {
    ...project,
    phases,
  };
}

/**
 * Create a new project
 */
export async function createProject(data: ProjectInsert): Promise<Project> {
  const supabase = getServerSupabaseClient();

  const { data: newProject, error } = await supabase
    .from('projects')
    .insert(data)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create project: ${error.message}`);
  }

  return newProject;
}

/**
 * Update a project
 */
export async function updateProject(
  projectId: string,
  organizationId: string,
  updates: ProjectUpdate
): Promise<Project> {
  const supabase = getServerSupabaseClient();

  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .eq('organization_id', organizationId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update project: ${error.message}`);
  }

  return data;
}

/**
 * Delete a project (soft delete by setting status to archived)
 */
export async function deleteProject(
  projectId: string,
  organizationId: string
): Promise<void> {
  const supabase = getServerSupabaseClient();

  // Soft delete by setting status to archived
  const { error } = await supabase
    .from('projects')
    .update({ status: 'archived' })
    .eq('id', projectId)
    .eq('organization_id', organizationId);

  if (error) {
    throw new Error(`Failed to delete project: ${error.message}`);
  }
}

/**
 * Get project statistics for an organization
 */
export async function getProjectStats(organizationId: string): Promise<{
  total: number;
  not_started: number;
  active: number;
  on_hold: number;
  under_contract: number;
  irsa: number;
  sold: number;
  warranty_period: number;
  archived: number;
}> {
  const supabase = getServerSupabaseClient();

  const { data, error } = await supabase
    .from('projects')
    .select('status')
    .eq('organization_id', organizationId);

  if (error) {
    throw new Error(`Failed to get project stats: ${error.message}`);
  }

  const stats = {
    total: 0,
    not_started: 0,
    active: 0,
    on_hold: 0,
    under_contract: 0,
    irsa: 0,
    sold: 0,
    warranty_period: 0,
    archived: 0,
  };

  data.forEach((project) => {
    if (project.status === 'not_started') {
      stats.not_started++;
      stats.total++;
    } else if (project.status === 'active') {
      stats.active++;
      stats.total++;
    } else if (project.status === 'on_hold') {
      stats.on_hold++;
      stats.total++;
    } else if (project.status === 'under_contract') {
      stats.under_contract++;
      stats.total++;
    } else if (project.status === 'irsa') {
      stats.irsa++;
      stats.total++;
    } else if (project.status === 'sold') {
      stats.sold++;
      stats.total++;
    } else if (project.status === 'warranty_period') {
      stats.warranty_period++;
      stats.total++;
    } else if (project.status === 'archived') {
      stats.archived++;
      // Don't increment total for archived projects
    }
  });

  return stats;
}

/**
 * Check if a project exists and belongs to the organization
 */
export async function projectExists(
  projectId: string,
  organizationId: string
): Promise<boolean> {
  const supabase = getServerSupabaseClient();

  const { data, error } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('organization_id', organizationId)
    .single();

  return !error && !!data;
}
