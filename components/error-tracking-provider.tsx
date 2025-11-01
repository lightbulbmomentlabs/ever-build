'use client';

import { useEffect } from 'react';
import { logJavaScriptError, logNetworkError } from '@/lib/utils/error-tracking';

/**
 * Error Tracking Provider
 *
 * Sets up global error handlers to catch and log unhandled errors.
 * Should be placed high in the component tree.
 */
export function ErrorTrackingProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Global error handler for uncaught errors
    const handleError = (event: ErrorEvent) => {
      event.preventDefault(); // Prevent default browser error handling

      logJavaScriptError(
        new Error(event.message),
        'GlobalErrorHandler',
        'Uncaught error'
      );
    };

    // Global handler for unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault(); // Prevent default browser error handling

      const error = event.reason instanceof Error
        ? event.reason
        : new Error(String(event.reason));

      logJavaScriptError(
        error,
        'GlobalErrorHandler',
        'Unhandled promise rejection'
      );
    };

    // Handler for fetch/network errors
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);

        // Log 5xx errors as network errors
        if (response.status >= 500) {
          logNetworkError(
            new Error(`HTTP ${response.status}: ${response.statusText}`),
            `Fetch to ${args[0]}`
          );
        }

        return response;
      } catch (error) {
        // Log network failures
        logNetworkError(
          error instanceof Error ? error : new Error(String(error)),
          `Fetch to ${args[0]}`
        );
        throw error;
      }
    };

    // Add event listeners
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.fetch = originalFetch;
    };
  }, []);

  return <>{children}</>;
}
