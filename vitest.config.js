import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom', // Simulates a browser environment for React components
    globals: true,        // Allows using describe/it/expect without importing them
    setupFiles: './tests/setup.js', // Optional: for global mocks (like Firebase) later
  },
});
