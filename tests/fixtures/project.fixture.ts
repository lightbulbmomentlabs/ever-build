/**
 * Project test fixtures
 *
 * Reusable test data for projects
 */

export const mockProject = {
  id: 'project-123',
  organization_id: 'test-org-id',
  name: 'Test Project',
  address: '123 Test St',
  city: 'Austin',
  state: 'TX',
  zip_code: '78701',
  lot_number: 'Lot 5',
  model_type: 'Standard 2-Story',
  square_footage: 2500,
  status: 'active',
  target_completion_date: '2025-12-31',
  actual_completion_date: null,
  notes: 'Test project notes',
  created_by: 'test-user-id',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
};

export const mockProjects = [
  mockProject,
  {
    ...mockProject,
    id: 'project-456',
    name: 'Another Project',
    address: '456 Oak Ave',
  },
  {
    ...mockProject,
    id: 'project-789',
    name: 'Third Project',
    address: '789 Maple Dr',
    status: 'completed',
  },
];

export function createMockProject(overrides: Partial<typeof mockProject> = {}) {
  return {
    ...mockProject,
    ...overrides,
  };
}
