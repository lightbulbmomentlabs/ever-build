'use client';

/**
 * Project Form Component
 *
 * Form for creating and editing projects
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
];

type Project = {
  id?: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  lot_number?: string | null;
  block_number?: string | null;
  subdivision?: string | null;
  parcel_number?: string | null;
  model_type?: string | null;
  square_footage?: number | null;
  status: 'not_started' | 'active' | 'on_hold' | 'under_contract' | 'irsa' | 'sold' | 'warranty_period' | 'archived';
  target_completion_date: string;
  actual_completion_date?: string | null;
  notes?: string | null;
  baseline_start_date?: string | null;
  baseline_duration_days?: number | null;
  baseline_set_date?: string | null;
};

interface ProjectFormProps {
  project?: Project;
  mode: 'create' | 'edit';
}

export function ProjectForm({ project, mode }: ProjectFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: project?.name || '',
    address: project?.address || '',
    city: project?.city || '',
    state: project?.state || '',
    zip_code: project?.zip_code || '',
    lot_number: project?.lot_number || '',
    block_number: project?.block_number || '',
    subdivision: project?.subdivision || '',
    parcel_number: project?.parcel_number || '',
    model_type: project?.model_type || '',
    square_footage: project?.square_footage || '',
    status: project?.status || 'not_started',
    target_completion_date: project?.target_completion_date
      ? new Date(project.target_completion_date).toISOString().split('T')[0]
      : '',
    actual_completion_date: project?.actual_completion_date
      ? new Date(project.actual_completion_date).toISOString().split('T')[0]
      : '',
    notes: project?.notes || '',
    baseline_start_date: project?.baseline_start_date
      ? new Date(project.baseline_start_date).toISOString().split('T')[0]
      : '',
    baseline_duration_days: project?.baseline_duration_days || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const url = mode === 'create' ? '/api/projects' : `/api/projects/${project?.id}`;
      const method = mode === 'create' ? 'POST' : 'PATCH';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          lot_number: formData.lot_number || null,
          block_number: formData.block_number || null,
          subdivision: formData.subdivision || null,
          parcel_number: formData.parcel_number || null,
          model_type: formData.model_type || null,
          square_footage: formData.square_footage ? parseInt(formData.square_footage as string) : null,
          actual_completion_date: formData.actual_completion_date || null,
          notes: formData.notes || null,
          baseline_start_date: formData.baseline_start_date || null,
          baseline_duration_days: formData.baseline_duration_days ? parseInt(formData.baseline_duration_days as string) : null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save project');
      }

      router.push('/projects');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save project');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === 'create' ? 'Create New Project' : 'Edit Project'}</CardTitle>
        <CardDescription>
          {mode === 'create'
            ? 'Add a new construction project to your portfolio.'
            : 'Update project information.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-md bg-error-red/10 p-3 text-sm text-error-red">
              {error}
            </div>
          )}

          {/* Project Name and Status */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                required
                placeholder="e.g., Sunset Hills Development - Lot 42"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as Project['status'] })}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                  <SelectItem value="under_contract">Under Contract</SelectItem>
                  <SelectItem value="irsa">IRSA</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="warranty_period">Warranty Period</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Address Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Street Address *</Label>
              <Input
                id="address"
                required
                placeholder="123 Main Street"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-6">
              <div className="space-y-2 md:col-span-3">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="state">State *</Label>
                <Select
                  value={formData.state}
                  onValueChange={(value) => setFormData({ ...formData, state: value })}
                >
                  <SelectTrigger id="state">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map((state) => (
                      <SelectItem key={state.value} value={state.value}>
                        {state.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="zip_code">ZIP Code *</Label>
                <Input
                  id="zip_code"
                  required
                  placeholder="90210"
                  value={formData.zip_code}
                  onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="lot_number">Lot Number</Label>
              <Input
                id="lot_number"
                placeholder="42"
                value={formData.lot_number}
                onChange={(e) => setFormData({ ...formData, lot_number: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="block_number">Block Number</Label>
              <Input
                id="block_number"
                placeholder="5"
                value={formData.block_number}
                onChange={(e) => setFormData({ ...formData, block_number: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subdivision">Sub-division</Label>
              <Input
                id="subdivision"
                placeholder="Oak Hills"
                value={formData.subdivision}
                onChange={(e) => setFormData({ ...formData, subdivision: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parcel_number">Parcel Number (PIN)</Label>
              <Input
                id="parcel_number"
                placeholder="123-456-789"
                value={formData.parcel_number}
                onChange={(e) => setFormData({ ...formData, parcel_number: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="model_type">Model Type</Label>
              <Input
                id="model_type"
                placeholder="e.g., Ranch, Colonial, Modern"
                value={formData.model_type}
                onChange={(e) => setFormData({ ...formData, model_type: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="square_footage">Square Footage</Label>
              <Input
                id="square_footage"
                type="number"
                min="0"
                placeholder="2500"
                value={formData.square_footage}
                onChange={(e) => setFormData({ ...formData, square_footage: e.target.value })}
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="target_completion_date">Target Completion Date *</Label>
              <Input
                id="target_completion_date"
                type="date"
                required
                value={formData.target_completion_date}
                onChange={(e) => setFormData({ ...formData, target_completion_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="actual_completion_date">Actual Completion Date</Label>
              <Input
                id="actual_completion_date"
                type="date"
                value={formData.actual_completion_date}
                onChange={(e) => setFormData({ ...formData, actual_completion_date: e.target.value })}
              />
            </div>
          </div>

          {/* Baseline Timeline (Optional) */}
          <div className="border-t pt-4">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-charcoal-blue">Baseline Timeline (Optional)</h3>
              <p className="text-xs text-steel-gray mt-1">
                Set your initial timeline commitment to track schedule adherence
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="baseline_start_date">Baseline Start Date</Label>
                <Input
                  id="baseline_start_date"
                  type="date"
                  value={formData.baseline_start_date}
                  onChange={(e) => setFormData({ ...formData, baseline_start_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="baseline_duration_days">Estimated Duration (days)</Label>
                <Input
                  id="baseline_duration_days"
                  type="number"
                  min="1"
                  placeholder="e.g., 90"
                  value={formData.baseline_duration_days}
                  onChange={(e) => setFormData({ ...formData, baseline_duration_days: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2 pb-24">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Any additional notes about this project..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

/**
 * ProjectFormWrapper Component
 *
 * Wrapper component that includes the form and sticky footer
 */
interface ProjectFormWrapperProps {
  project?: Project;
  mode: 'create' | 'edit';
}

export function ProjectFormWrapper({ project, mode }: ProjectFormWrapperProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = () => {
    const form = document.querySelector('form');
    if (form) {
      form.requestSubmit();
    }
  };

  return (
    <>
      <ProjectForm project={project} mode={mode} />

      {/* Sticky Footer Bar */}
      <div className="fixed bottom-0 left-0 right-0 md:left-64 border-t bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 z-50">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex justify-end gap-3 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/projects')}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
            >
              {mode === 'create' ? 'Create Project' : 'Update Project'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
