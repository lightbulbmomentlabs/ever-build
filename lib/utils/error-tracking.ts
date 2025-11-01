/**
 * Error Tracking Utilities
 *
 * Client-side error tracking functions to log errors to the backend.
 */

export interface ErrorTrackingOptions {
  error_message: string;
  error_stack?: string;
  error_type?: 'javascript' | 'api' | 'database' | 'authentication' | 'validation' | 'network' | 'unknown';
  page_url: string;
  user_action?: string;
  component_name?: string;
  severity?: 'warning' | 'error' | 'critical';
}

/**
 * Log an error to the backend
 */
export async function logError(options: ErrorTrackingOptions): Promise<void> {
  try {
    // Don't log in development unless explicitly enabled
    if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_ENABLE_ERROR_TRACKING) {
      console.error('Error (not logged):', options);
      return;
    }

    await fetch('/api/errors/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });
  } catch (error) {
    // Fail silently - don't want error logging to cause more errors
    console.error('Failed to log error:', error);
  }
}

/**
 * Log a JavaScript error
 */
export async function logJavaScriptError(
  error: Error,
  componentName?: string,
  userAction?: string
): Promise<void> {
  await logError({
    error_message: error.message,
    error_stack: error.stack,
    error_type: 'javascript',
    page_url: window.location.href,
    user_action: userAction,
    component_name: componentName,
    severity: 'error',
  });
}

/**
 * Log an API error
 */
export async function logApiError(
  error: Error,
  endpoint: string,
  userAction?: string
): Promise<void> {
  await logError({
    error_message: `API Error: ${error.message}`,
    error_stack: error.stack,
    error_type: 'api',
    page_url: window.location.href,
    user_action: userAction || `API call to ${endpoint}`,
    component_name: endpoint,
    severity: 'error',
  });
}

/**
 * Log a validation error
 */
export async function logValidationError(
  message: string,
  componentName: string,
  userAction?: string
): Promise<void> {
  await logError({
    error_message: message,
    error_type: 'validation',
    page_url: window.location.href,
    user_action: userAction,
    component_name: componentName,
    severity: 'warning',
  });
}

/**
 * Log a network error
 */
export async function logNetworkError(
  error: Error,
  userAction?: string
): Promise<void> {
  await logError({
    error_message: `Network Error: ${error.message}`,
    error_stack: error.stack,
    error_type: 'network',
    page_url: window.location.href,
    user_action: userAction,
    severity: 'error',
  });
}

/**
 * Log a critical error
 */
export async function logCriticalError(
  error: Error,
  componentName?: string,
  userAction?: string
): Promise<void> {
  await logError({
    error_message: error.message,
    error_stack: error.stack,
    error_type: 'javascript',
    page_url: window.location.href,
    user_action: userAction,
    component_name: componentName,
    severity: 'critical',
  });
}
