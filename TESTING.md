# Testing Guide - EverBuild MVP

This document provides comprehensive guidance on testing the EverBuild application.

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Running Tests](#running-tests)
4. [Writing Tests](#writing-tests)
5. [Test Organization](#test-organization)
6. [Debugging Tests](#debugging-tests)
7. [Coverage Reports](#coverage-reports)
8. [CI/CD Integration](#ci-cd-integration)
9. [Best Practices](#best-practices)

---

## Overview

### Testing Philosophy

EverBuild uses a multi-layered testing approach to ensure code quality and prevent regressions:

- **Unit Tests**: Fast, isolated tests for individual functions
- **Integration Tests**: Test API routes and database operations
- **Component Tests**: Test React components in isolation
- **End-to-End Tests**: Test complete user workflows

### Coverage Requirements

- **Business Logic**: 80% minimum coverage
- **Critical Paths** (auth, SMS, mutations): 100% coverage
- **API Routes**: 100% coverage
- **React Components**: 70% coverage
- **Overall**: 75% minimum

---

## Getting Started

### Installation

All testing dependencies are included in the project. After cloning:

```bash
pnpm install
```

### Test Environment Setup

1. **Environment Variables**: Create `.env.test` for test-specific variables:
```bash
# .env.test
NEXT_PUBLIC_SUPABASE_URL=https://your-test-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-test-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-test-service-role-key

# Twilio Test Credentials
TWILIO_ACCOUNT_SID=your-test-account-sid
TWILIO_AUTH_TOKEN=your-test-auth-token
TWILIO_PHONE_NUMBER=+15005550006  # Twilio test number

# Clerk Test Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

2. **Test Database**: Use a separate Supabase project for testing or local Postgres instance

3. **Test Data**: Seed scripts are in `/tests/seeds/`

---

## Running Tests

### All Tests

```bash
pnpm test
```

### Watch Mode (recommended during development)

```bash
pnpm test:watch
```

### Unit Tests Only

```bash
pnpm test:unit
```

### Integration Tests Only

```bash
pnpm test:integration
```

### Component Tests Only

```bash
pnpm test:components
```

### End-to-End Tests

```bash
pnpm test:e2e
```

### Run Specific Test File

```bash
pnpm test path/to/test-file.test.ts
```

### Run Tests Matching Pattern

```bash
pnpm test --grep "ContactForm"
```

### Coverage Report

```bash
pnpm test:coverage
```

Opens HTML coverage report in browser after running.

---

## Writing Tests

### Unit Tests

**Location**: `/tests/unit/`

**Purpose**: Test pure functions, utilities, and business logic in isolation

**Example**:

```typescript
// tests/unit/utils/date-utils.test.ts
import { describe, it, expect } from 'vitest';
import { calculatePhaseEndDate, addBusinessDays } from '@/lib/utils/date-utils';

describe('calculatePhaseEndDate', () => {
  it('should add duration days to start date', () => {
    const start = new Date('2025-01-01');
    const duration = 10;
    const result = calculatePhaseEndDate(start, duration);

    expect(result).toEqual(new Date('2025-01-11'));
  });

  it('should handle edge case of 0 duration', () => {
    const start = new Date('2025-01-01');
    const duration = 0;
    const result = calculatePhaseEndDate(start, duration);

    expect(result).toEqual(start);
  });
});

describe('addBusinessDays', () => {
  it('should skip weekends', () => {
    const friday = new Date('2025-01-10'); // Friday
    const result = addBusinessDays(friday, 1);

    // Should skip weekend and land on Monday
    expect(result).toEqual(new Date('2025-01-13'));
  });
});
```

### Integration Tests

**Location**: `/tests/integration/`

**Purpose**: Test API routes, database operations, and external service integrations

**Example**:

```typescript
// tests/integration/api/projects.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createProject, getProject } from '@/lib/services/project.service';
import { createMockAuthContext } from '@/tests/helpers/auth';
import { cleanupDatabase } from '@/tests/helpers/database';

describe('Project Service', () => {
  let authContext: any;
  let orgId: string;

  beforeEach(async () => {
    authContext = await createMockAuthContext();
    orgId = authContext.organization.id;
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  describe('createProject', () => {
    it('should create project with valid data', async () => {
      const projectData = {
        name: 'Test Project',
        address: '123 Test St',
        city: 'Austin',
        state: 'TX',
        zip_code: '78701',
        target_completion_date: '2025-12-31'
      };

      const result = await createProject(orgId, projectData);

      expect(result.success).toBe(true);
      expect(result.data.name).toBe('Test Project');
      expect(result.data.organization_id).toBe(orgId);
    });

    it('should reject invalid zip code', async () => {
      const projectData = {
        name: 'Test Project',
        address: '123 Test St',
        city: 'Austin',
        state: 'TX',
        zip_code: 'invalid',
        target_completion_date: '2025-12-31'
      };

      const result = await createProject(orgId, projectData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid zip code');
    });
  });

  describe('getProject', () => {
    it('should retrieve project by id', async () => {
      const created = await createProject(orgId, mockProjectData);
      const retrieved = await getProject(created.data.id);

      expect(retrieved.data.id).toBe(created.data.id);
      expect(retrieved.data.name).toBe(mockProjectData.name);
    });

    it('should return error for non-existent project', async () => {
      const result = await getProject('non-existent-id');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });
});
```

### Component Tests

**Location**: `/tests/components/`

**Purpose**: Test React components with user interactions

**Example**:

```typescript
// tests/components/ContactForm.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactForm } from '@/components/contacts/ContactForm';

describe('ContactForm', () => {
  it('should render all fields', () => {
    render(<ContactForm onSubmit={vi.fn()} />);

    expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contact person/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/trade/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<ContactForm onSubmit={onSubmit} />);

    const submitButton = screen.getByRole('button', { name: /save/i });
    await user.click(submitButton);

    expect(await screen.findByText(/company name is required/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should validate phone number format', async () => {
    const user = userEvent.setup();

    render(<ContactForm onSubmit={vi.fn()} />);

    const phoneInput = screen.getByLabelText(/phone/i);
    await user.type(phoneInput, '123'); // Invalid phone
    await user.tab(); // Blur to trigger validation

    expect(await screen.findByText(/invalid phone number/i)).toBeInTheDocument();
  });

  it('should submit valid form data', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<ContactForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/company name/i), 'ABC Plumbing');
    await user.type(screen.getByLabelText(/contact person/i), 'John Doe');
    await user.selectOptions(screen.getByLabelText(/trade/i), 'Plumbing');
    await user.type(screen.getByLabelText(/phone/i), '512-555-0100');

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        company_name: 'ABC Plumbing',
        contact_person: 'John Doe',
        trade: 'Plumbing',
        phone_primary: '512-555-0100'
      });
    });
  });
});
```

### End-to-End Tests

**Location**: `/tests/e2e/`

**Purpose**: Test complete user workflows across multiple pages

**Example**:

```typescript
// tests/e2e/project-creation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Project Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login with test user
    await page.goto('/sign-in');
    await page.fill('[name="email"]', 'test@everbuild.com');
    await page.fill('[name="password"]', 'TestPassword123!');
    await page.click('button:has-text("Sign In")');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should create project with template', async ({ page }) => {
    // Navigate to project creation
    await page.click('text=New Project');
    await expect(page).toHaveURL('/projects/new');

    // Fill in project details
    await page.fill('[name="name"]', '123 Oak Street');
    await page.fill('[name="address"]', '123 Oak St');
    await page.fill('[name="city"]', 'Austin');
    await page.fill('[name="state"]', 'TX');
    await page.fill('[name="zip_code"]', '78701');
    await page.fill('[name="target_completion_date"]', '2025-12-31');

    // Select template
    await page.click('text=Use Template');
    await page.click('text=Standard 65-Day Spec Home');

    // Verify template phases loaded
    await expect(page.locator('text=Permitting')).toBeVisible();
    await expect(page.locator('text=Foundation')).toBeVisible();
    await expect(page.locator('text=Framing')).toBeVisible();

    // Submit
    await page.click('button:has-text("Create Project")');

    // Verify redirect to project page
    await expect(page).toHaveURL(/\/projects\/[a-z0-9-]+$/);
    await expect(page.locator('h1:has-text("123 Oak Street")')).toBeVisible();

    // Verify phases appear on timeline
    await expect(page.locator('text=Permitting')).toBeVisible();
    await expect(page.locator('text=Day 1-14')).toBeVisible();
  });

  test('should handle validation errors', async ({ page }) => {
    await page.click('text=New Project');

    // Try to submit empty form
    await page.click('button:has-text("Create Project")');

    // Check for validation errors
    await expect(page.locator('text=Project name is required')).toBeVisible();
    await expect(page.locator('text=Address is required')).toBeVisible();
  });
});
```

---

## Test Organization

### Directory Structure

```
tests/
├── unit/                    # Unit tests
│   ├── utils/
│   │   ├── date-utils.test.ts
│   │   └── validation.test.ts
│   └── services/
│       ├── project.service.test.ts
│       └── phase.service.test.ts
│
├── integration/            # Integration tests
│   ├── api/
│   │   ├── projects.test.ts
│   │   ├── contacts.test.ts
│   │   └── phases.test.ts
│   └── database/
│       └── queries.test.ts
│
├── components/             # Component tests
│   ├── contacts/
│   │   ├── ContactForm.test.tsx
│   │   └── ContactList.test.tsx
│   ├── projects/
│   │   └── ProjectForm.test.tsx
│   └── shared/
│       └── Button.test.tsx
│
├── e2e/                    # End-to-end tests
│   ├── auth.spec.ts
│   ├── project-creation.spec.ts
│   ├── contact-management.spec.ts
│   └── sms-sending.spec.ts
│
├── fixtures/              # Test data
│   ├── project.fixture.ts
│   ├── contact.fixture.ts
│   └── user.fixture.ts
│
├── helpers/               # Test utilities
│   ├── auth.ts
│   ├── database.ts
│   └── setup.ts
│
└── setup.ts              # Global test setup
```

### Naming Conventions

**Files**:
- Unit/Integration/Component tests: `*.test.ts` or `*.test.tsx`
- E2E tests: `*.spec.ts`

**Test Descriptions**:
- Use descriptive names that explain what is being tested
- Start with action verbs: "should...", "can...", "returns..."
- Be specific: "should return error for invalid email" (good) vs "should validate" (bad)

**Examples**:
```typescript
// Good
describe('calculatePhaseEndDate', () => {
  it('should add duration days to start date', () => {})
  it('should handle zero duration', () => {})
  it('should throw error for negative duration', () => {})
})

// Bad
describe('dates', () => {
  it('works', () => {})
  it('handles edge cases', () => {})
})
```

---

## Debugging Tests

### Debugging in VS Code

1. Add breakpoint in test file
2. Run test with debugger:
```bash
pnpm test:debug
```

### Viewing Component Renders

```typescript
import { render, screen, debug } from '@testing-library/react';

it('should render component', () => {
  render(<MyComponent />);

  // Print DOM to console
  screen.debug();

  // Or debug specific element
  const element = screen.getByText('Hello');
  screen.debug(element);
});
```

### Verbose Test Output

```bash
pnpm test --reporter=verbose
```

### Run Single Test

```typescript
// Use .only to run just this test
it.only('should do something', () => {
  // ...
});
```

### Skip Failing Tests Temporarily

```typescript
// Use .skip to skip this test
it.skip('should do something', () => {
  // ...
});
```

---

## Coverage Reports

### Generate Coverage

```bash
pnpm test:coverage
```

### View HTML Report

Coverage report opens automatically in browser at:
```
coverage/index.html
```

### Coverage Thresholds

Configured in `vitest.config.ts`:

```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      thresholds: {
        global: {
          lines: 75,
          functions: 75,
          branches: 70,
          statements: 75
        }
      },
      exclude: [
        'tests/**',
        '*.config.*',
        'app/layout.tsx', // Exclude Next.js layouts
      ]
    }
  }
});
```

### Interpreting Coverage

- **Lines**: Percentage of code lines executed
- **Functions**: Percentage of functions called
- **Branches**: Percentage of conditional branches taken
- **Statements**: Percentage of statements executed

**Aim for**:
- Critical business logic: 100%
- API routes: 100%
- Components: 70-80%
- Overall: 75%+

---

## CI/CD Integration

### GitHub Actions Workflow

Tests run automatically on:
- Every pull request
- Every push to `main`
- Scheduled nightly builds

**Workflow file**: `.github/workflows/test.yml`

```yaml
name: Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install

      - name: Run tests
        run: pnpm test:ci
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.TEST_SUPABASE_ANON_KEY }}

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

### Required Secrets

Configure in GitHub Settings > Secrets:
- `TEST_SUPABASE_URL`
- `TEST_SUPABASE_ANON_KEY`
- `TEST_CLERK_PUBLISHABLE_KEY`
- `TEST_CLERK_SECRET_KEY`
- `TWILIO_TEST_ACCOUNT_SID`
- `TWILIO_TEST_AUTH_TOKEN`

---

## Best Practices

### 1. Write Tests First (TDD)

```typescript
// 1. Write failing test
it('should calculate phase end date', () => {
  const result = calculatePhaseEndDate(startDate, duration);
  expect(result).toEqual(expectedDate);
});

// 2. Implement function to pass test
export function calculatePhaseEndDate(start: Date, duration: number): Date {
  return addDays(start, duration);
}

// 3. Refactor with confidence
```

### 2. Test Behavior, Not Implementation

```typescript
// Bad - tests implementation details
it('should call setState with value', () => {
  const setState = vi.fn();
  handleChange('test', setState);
  expect(setState).toHaveBeenCalledWith('test');
});

// Good - tests user-facing behavior
it('should update input value when user types', async () => {
  render(<MyForm />);
  await userEvent.type(screen.getByLabelText('Name'), 'John');
  expect(screen.getByLabelText('Name')).toHaveValue('John');
});
```

### 3. Keep Tests Independent

```typescript
// Bad - tests depend on each other
let project;
it('should create project', () => {
  project = createProject();
});
it('should update project', () => {
  updateProject(project.id); // Depends on previous test
});

// Good - each test is independent
it('should create project', () => {
  const project = createProject();
  expect(project).toBeDefined();
});
it('should update project', () => {
  const project = createProject(); // Create own test data
  updateProject(project.id);
  expect(project.updated).toBe(true);
});
```

### 4. Use Descriptive Test Data

```typescript
// Bad
const data = { a: 'x', b: 'y' };

// Good
const projectData = {
  name: 'Test Project - Sunny Hills',
  address: '123 Oak Street',
  city: 'Austin',
  state: 'TX'
};
```

### 5. Test Edge Cases

```typescript
describe('addBusinessDays', () => {
  it('should handle normal weekdays', () => {});
  it('should skip weekends', () => {});
  it('should handle adding 0 days', () => {});
  it('should handle negative days', () => {});
  it('should handle crossing month boundaries', () => {});
  it('should handle crossing year boundaries', () => {});
});
```

### 6. Mock External Dependencies

```typescript
import { vi } from 'vitest';
import * as twilioModule from '@/lib/twilio';

it('should send SMS via Twilio', async () => {
  // Mock Twilio to avoid real API calls
  const mockSendSMS = vi.spyOn(twilioModule, 'sendSMS')
    .mockResolvedValue({ success: true, sid: 'SM123' });

  await sendNotification(contact, message);

  expect(mockSendSMS).toHaveBeenCalledWith(
    contact.phone,
    message
  );
});
```

### 7. Use Test Helpers and Fixtures

```typescript
// tests/helpers/factories.ts
export function createMockProject(overrides = {}) {
  return {
    id: 'test-project-id',
    name: 'Test Project',
    address: '123 Test St',
    ...overrides
  };
}

// Usage in tests
it('should update project', () => {
  const project = createMockProject({ name: 'Custom Name' });
  updateProject(project);
  expect(project.name).toBe('Custom Name');
});
```

### 8. Clean Up After Tests

```typescript
import { afterEach } from 'vitest';

afterEach(async () => {
  // Clean up database
  await cleanupDatabase();

  // Reset mocks
  vi.clearAllMocks();

  // Clear local storage
  localStorage.clear();
});
```

---

## Troubleshooting

### Common Issues

#### Tests Timing Out

```typescript
// Increase timeout for slow operations
it('should complete long operation', async () => {
  // ...
}, 10000); // 10 second timeout
```

#### Flaky Tests

- Ensure tests clean up after themselves
- Avoid relying on timing (use `waitFor` instead of `setTimeout`)
- Check for race conditions
- Use deterministic test data

#### Module Not Found

- Check import paths are correct
- Ensure `@` alias is configured in `vitest.config.ts`
- Run `pnpm install` to ensure all deps installed

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Need help?** Check [FEATURE_TESTS.md](./FEATURE_TESTS.md) for specific feature test cases, or [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) for troubleshooting common problems.
