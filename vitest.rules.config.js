// vitest.rules.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/rules/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    environment: 'node',
    globals: true,
  },
});
