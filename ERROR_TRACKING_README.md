# Error Tracking System

This document explains how the error tracking system works and how to use it effectively.

## Overview

The error tracking system automatically captures and logs errors that occur in the application, making it easy for admins to monitor and resolve issues.

## Features

- **Automatic Error Capture**: Catches JavaScript errors, API failures, and network errors
- **Error Boundary**: Prevents errors from crashing the entire application
- **Admin Dashboard**: View and manage errors in the Admin panel
- **Error Details**: View stack traces, context information, and user details
- **Resolution Workflow**: Mark errors as resolved with notes
- **Filtering**: Filter errors by severity, type, and resolution status

## Components

### 1. Error Logging API (`/api/errors/log`)

Backend endpoint that receives error reports and stores them in the database.

**Accepts**:
- `error_message` (required): The error message
- `error_stack`: Full stack trace
- `error_type`: Type of error (javascript, api, database, authentication, validation, network, unknown)
- `page_url` (required): URL where the error occurred
- `user_action`: What the user was doing when the error occurred
- `component_name`: Name of the component that threw the error
- `severity`: Severity level (warning, error, critical)

### 2. Error Tracking Utilities (`lib/utils/error-tracking.ts`)

Helper functions to log errors from anywhere in your code:

```typescript
import {
  logJavaScriptError,
  logApiError,
  logValidationError,
  logNetworkError,
  logCriticalError
} from '@/lib/utils/error-tracking';

// Log a JavaScript error
try {
  // Your code
} catch (error) {
  logJavaScriptError(error, 'MyComponent', 'Button click');
}

// Log an API error
try {
  const response = await fetch('/api/data');
} catch (error) {
  logApiError(error, '/api/data', 'Fetching data');
}

// Log a validation error
if (!isValid) {
  logValidationError('Invalid input', 'MyForm', 'Form submission');
}

// Log a network error
try {
  await uploadFile(file);
} catch (error) {
  logNetworkError(error, 'File upload');
}

// Log a critical error
try {
  await criticalOperation();
} catch (error) {
  logCriticalError(error, 'CriticalComponent', 'Critical operation');
}
```

### 3. Error Boundary (`components/error-boundary.tsx`)

React component that catches errors in the component tree and displays a fallback UI.

**Usage**:

```tsx
import { ErrorBoundary } from '@/components/error-boundary';

// Wrap risky components
<ErrorBoundary componentName="MyFeature">
  <MyComponent />
</ErrorBoundary>

// With custom fallback
<ErrorBoundary
  componentName="MyFeature"
  fallback={<div>Something went wrong</div>}
>
  <MyComponent />
</ErrorBoundary>
```

### 4. Error Tracking Provider (`components/error-tracking-provider.tsx`)

Global error handler that catches unhandled errors and promise rejections.

Already integrated in the root layout - no additional setup needed!

## Viewing Errors

### Admin Dashboard

1. Navigate to `/admin/errors`
2. View all logged errors with filtering options
3. Click on any error to see full details
4. Mark errors as resolved with optional notes

### Error Statistics

The admin dashboard shows:
- Total errors
- Unresolved errors
- Critical errors
- Most common error type

### Error Details

Each error log includes:
- Error message and stack trace
- Severity level (warning, error, critical)
- Error type (javascript, api, database, etc.)
- Page URL and component name
- User action and context
- User information (if authenticated)
- Technical details (IP address, user agent)
- Resolution status and notes

## Development vs Production

By default, errors are **NOT logged in development** to reduce noise. To enable error tracking in development:

```bash
# Add to .env.local
NEXT_PUBLIC_ENABLE_ERROR_TRACKING=true
```

In production, all errors are automatically logged.

## Best Practices

1. **Use Error Boundaries**: Wrap major features or pages with `<ErrorBoundary>` to prevent errors from crashing the app

2. **Log API Errors**: Always wrap API calls with error logging:
   ```typescript
   try {
     const response = await fetch('/api/endpoint');
     const data = await response.json();
   } catch (error) {
     logApiError(error, '/api/endpoint', 'User action description');
     throw error; // Re-throw to let the UI handle it
   }
   ```

3. **Provide Context**: Always include `componentName` and `userAction` parameters to help with debugging

4. **Set Appropriate Severity**:
   - `warning`: Non-critical issues that don't prevent functionality
   - `error`: Errors that prevent a feature from working but don't crash the app
   - `critical`: Severe errors that crash the app or cause data loss

5. **Review Regularly**: Check the error logs dashboard regularly to identify and fix recurring issues

## Monitoring Workflow

1. **Detection**: Errors are automatically captured and logged
2. **Triage**: Admin reviews error logs and prioritizes by severity
3. **Investigation**: Admin views error details including stack trace and context
4. **Resolution**: Developer fixes the issue
5. **Verification**: Admin marks error as resolved with notes about the fix

## Database Schema

Errors are stored in the `error_logs` table with the following structure:

```sql
CREATE TABLE error_logs (
  id UUID PRIMARY KEY,
  user_id UUID,                    -- Reference to the user (if authenticated)
  clerk_user_id TEXT,              -- Clerk user ID
  user_email TEXT,                 -- User's email
  error_message TEXT NOT NULL,     -- Error message
  error_stack TEXT,                -- Full stack trace
  error_type TEXT NOT NULL,        -- Type of error
  page_url TEXT NOT NULL,          -- URL where error occurred
  user_action TEXT,                -- What user was doing
  component_name TEXT,             -- Component that threw error
  severity TEXT NOT NULL,          -- warning | error | critical
  resolved BOOLEAN DEFAULT false,  -- Resolution status
  resolved_at TIMESTAMPTZ,         -- When it was resolved
  resolved_by UUID,                -- Admin who resolved it
  resolution_notes TEXT,           -- Notes about resolution
  user_agent TEXT,                 -- Browser/device info
  ip_address TEXT,                 -- User's IP address
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

## Troubleshooting

### Errors not appearing in dashboard

1. Check that migrations have been applied (see `APPLY_THIS_ADMIN_MIGRATIONS.sql`)
2. Verify you're logged in as an admin user
3. Check browser console for any failed API calls to `/api/errors/log`

### Too many errors being logged

1. Filter by severity to focus on critical issues
2. Use the resolved filter to hide fixed errors
3. Consider adjusting the severity levels in your code

### Error tracking not working in development

Add `NEXT_PUBLIC_ENABLE_ERROR_TRACKING=true` to your `.env.local` file.
