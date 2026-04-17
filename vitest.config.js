import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'firebase-functions/v2/https': path.resolve(process.cwd(), 'tests/mocks/firebase-functions-v2-https.ts'),
    },
  },
  test: {
    include: [
      'tests/unit/**/*.{test,spec}.{js,jsx,ts,tsx}'
    ],
    environment: 'jsdom', // Simulates a browser environment for React components
    globals: true,        // Allows using describe/it/expect without importing them
    setupFiles: './tests/setup.ts', // Optional: for global mocks (like Firebase) later
  },
});
