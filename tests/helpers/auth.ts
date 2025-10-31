/**
 * Authentication test helpers
 *
 * These utilities help with:
 * - Mocking authenticated users
 * - Creating auth contexts for tests
 * - Simulating sign in/out
 */

/**
 * Create a mock auth context for tests
 */
export async function createMockAuthContext() {
  const organization = {
    id: 'test-org-id',
    name: 'Test Organization',
  };

  const user = {
    id: 'test-user-id',
    clerk_user_id: 'clerk_test_user',
    email: 'test@example.com',
    full_name: 'Test User',
    organization_id: organization.id,
  };

  return {
    user,
    organization,
    isAuthenticated: true,
  };
}

/**
 * Mock Clerk session
 */
export function mockClerkSession() {
  return {
    userId: 'clerk_test_user',
    sessionId: 'sess_test',
    getToken: async () => 'test-token',
  };
}

/**
 * Create auth headers for API requests
 */
export function createAuthHeaders() {
  return {
    'Cookie': 'clerk_session=test-session',
    'Authorization': 'Bearer test-token',
  };
}
