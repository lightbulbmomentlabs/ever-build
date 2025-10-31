import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Test environment
    environment: 'jsdom',

    // Setup files
    setupFiles: ['./tests/setup.ts'],

    // Global test utilities
    globals: true,

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/**',
        '*.config.*',
        'app/layout.tsx',
        'app/page.tsx',
        'next.config.ts',
        'tailwind.config.ts',
        'postcss.config.js',
        '.next/**',
        'out/**',
        'public/**',
        '**/*.d.ts',
        '**/*.spec.ts',
        '**/*.test.ts',
        '**/*.spec.tsx',
        '**/*.test.tsx',
      ],
      thresholds: {
        global: {
          lines: 75,
          functions: 75,
          branches: 70,
          statements: 75,
        },
      },
    },

    // Test include/exclude patterns
    include: [
      'tests/unit/**/*.test.{ts,tsx}',
      'tests/integration/**/*.test.{ts,tsx}',
      'tests/components/**/*.test.{ts,tsx}',
    ],
    exclude: [
      'node_modules',
      '.next',
      'out',
      'tests/e2e/**',
    ],

    // Timeout
    testTimeout: 10000,
    hookTimeout: 10000,

    // Reporters
    reporters: ['verbose'],

    // Retry failed tests
    retry: 0,

    // Allow console logs in tests (set to false to suppress)
    silent: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@/app': path.resolve(__dirname, './app'),
      '@/components': path.resolve(__dirname, './components'),
      '@/lib': path.resolve(__dirname, './lib'),
      '@/tests': path.resolve(__dirname, './tests'),
    },
  },
});
