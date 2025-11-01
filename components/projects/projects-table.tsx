'use client';

/**
 * Projects Table Component
 *
 * Displays list of projects:
 * - Desktop: Table view
 * - Mobile: Card grid layout
 */

import { useState } from 'react';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CircularProgress } from '@/components/ui/circular-progress';
import { DestructiveConfirmationDialog } from '@/components/ui/destructive-confirmation-dialog';
import { ProjectCard } from './project-card';
import { calculateCompletionPercentage } from '@/lib/utils/project-metrics';
import type { ProjectWithPhases } from '@/lib/services/project.service';

interface ProjectsTableProps {
  projects: ProjectWithPhases[];
}

const statusColors = {
  not_started: 'bg-steel-gray/10 text-steel-gray',
  active: 'bg-success-green/10 text-success-green',
  on_hold: 'bg-warning-amber/10 text-warning-amber',
  under_contract: 'bg-blueprint-teal/10 text-blueprint-teal',
  irsa: 'bg-purple-500/10 text-purple-600',
  sold: 'bg-success-green/10 text-success-green',
  warranty_period: 'bg-blue-500/10 text-blue-600',
  archived: 'bg-error-red/10 text-error-red',
};

const statusLabels = {
  not_started: 'Not Started',
  active: 'Active',
  on_hold: 'On Hold',
  under_contract: 'Under Contract',
  irsa: 'IRSA',
  sold: 'Sold',
  warranty_period: 'Warranty Period',
  archived: 'Archived',
};

export function ProjectsTable({ projects: initialProjects }: ProjectsTableProps) {
  const [projects, setProjects] = useState(initialProjects);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<{ slug: string; id: string; name: string } | null>(null);

  // Filter projects based on search term and status
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleDeleteClick = (projectSlug: string, projectId: string, projectName: string) => {
    setProjectToDelete({ slug: projectSlug, id: projectId, name: projectName });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectToDelete.slug}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      // Remove project from local state
      setProjects(projects.filter((p) => p.id !== projectToDelete.id));
      setProjectToDelete(null);
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
        <Input
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:max-w-sm text-base"
        />
        <select
          className="flex h-12 md:h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base md:text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:max-w-[200px]"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="not_started">Not Started</option>
          <option value="active">Active</option>
          <option value="on_hold">On Hold</option>
          <option value="under_contract">Under Contract</option>
          <option value="irsa">IRSA</option>
          <option value="sold">Sold</option>
          <option value="warranty_period">Warranty Period</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Mobile Card Grid */}
      <div className="grid gap-4 md:hidden">
        {filteredProjects.length === 0 ? (
          <div className="rounded-lg border bg-white p-8 text-center">
            <p className="text-steel-gray">No projects found.</p>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={(slug, id) => handleDeleteClick(slug, id, project.name)}
              isDeleting={isLoading}
            />
          ))
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Completion</TableHead>
              <TableHead>Target Completion</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-steel-gray">
                  No projects found.
                </TableCell>
              </TableRow>
            ) : (
              filteredProjects.map((project) => {
                const completionPercentage = calculateCompletionPercentage(project.phases || []);

                return (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/projects/${project.slug}`}
                        className="text-blueprint-teal hover:underline"
                      >
                        {project.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {project.city}, {project.state}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          statusColors[project.status]
                        }`}
                      >
                        {statusLabels[project.status]}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <CircularProgress
                          percentage={completionPercentage}
                          size={48}
                          strokeWidth={4}
                        />
                        <span className="text-sm font-medium text-steel-gray">
                          {completionPercentage}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(project.target_completion_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/projects/${project.slug}/edit`}>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(project.slug, project.id, project.name)}
                          disabled={isLoading}
                          className="text-steel-gray hover:text-error-red hover:bg-error-red/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <DestructiveConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Project"
        description={`Are you sure you want to delete ${projectToDelete?.name}? This will permanently remove the project and all associated phases, tasks, and documents.`}
        itemName={projectToDelete?.name}
        confirmationWord="DELETE"
        confirmButtonLabel="Delete Project"
        isLoading={isLoading}
      />
    </div>
  );
}
