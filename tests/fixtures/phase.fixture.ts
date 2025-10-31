/**
 * Phase test fixtures
 *
 * Reusable test data for phases
 */

export const mockPhase = {
  id: 'phase-123',
  project_id: 'project-123',
  name: 'Foundation',
  description: 'Pour foundation and footings',
  sequence_order: 1,
  planned_start_date: '2025-02-01',
  planned_duration_days: 7,
  planned_end_date: '2025-02-08',
  actual_start_date: null,
  actual_end_date: null,
  status: 'not_started',
  predecessor_phase_id: null,
  buffer_days: 0,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
};

export const mockPhases = [
  mockPhase,
  {
    ...mockPhase,
    id: 'phase-456',
    name: 'Framing',
    sequence_order: 2,
    planned_start_date: '2025-02-09',
    planned_duration_days: 10,
    planned_end_date: '2025-02-19',
    predecessor_phase_id: 'phase-123',
  },
  {
    ...mockPhase,
    id: 'phase-789',
    name: 'Rough-In Plumbing',
    sequence_order: 3,
    planned_start_date: '2025-02-20',
    planned_duration_days: 3,
    planned_end_date: '2025-02-23',
    predecessor_phase_id: 'phase-456',
  },
];

export function createMockPhase(overrides: Partial<typeof mockPhase> = {}) {
  return {
    ...mockPhase,
    ...overrides,
  };
}
