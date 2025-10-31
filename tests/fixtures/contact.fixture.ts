/**
 * Contact test fixtures
 *
 * Reusable test data for contacts (subcontractors/vendors)
 */

export const mockContact = {
  id: 'contact-123',
  organization_id: 'test-org-id',
  company_name: 'ABC Plumbing',
  contact_person: 'John Doe',
  trade: 'Plumbing',
  phone_primary: '512-555-0100',
  phone_secondary: null,
  email: 'john@abcplumbing.com',
  lead_time_days: 2,
  notes: 'Reliable plumber, works quickly',
  is_active: true,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
};

export const mockContacts = [
  mockContact,
  {
    ...mockContact,
    id: 'contact-456',
    company_name: 'XYZ Electric',
    contact_person: 'Jane Smith',
    trade: 'Electrical',
    phone_primary: '512-555-0200',
    email: 'jane@xyzelectric.com',
  },
  {
    ...mockContact,
    id: 'contact-789',
    company_name: 'Smith Framing',
    contact_person: 'Bob Smith',
    trade: 'Framing',
    phone_primary: '512-555-0300',
    email: 'bob@smithframing.com',
  },
];

export function createMockContact(overrides: Partial<typeof mockContact> = {}) {
  return {
    ...mockContact,
    ...overrides,
  };
}
