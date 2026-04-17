import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';

const useEmulators = process.env.VITE_USE_EMULATORS === 'true';

export default defineConfig({
  globalSetup: './tests/e2e/global-setup.ts',
  testDir: './tests/e2e',
  fullyParallel: true,
  // Reduce parallelism for emulators to prevent overloading the local Firestore/Auth emulator
  workers: useEmulators ? 3 : undefined,
  // Allow automatic retries in emulator mode to handle infrastructure flakiness
  retries: useEmulators ? 2 : 0,
  reporter: 'html', // Generates a nice webpage with test results
  use: {
    baseURL: 'http://localhost:5173', // Your Vite local dev URL
    trace: 'on-first-retry', // Takes screenshots/logs if a test fails
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }
  ],
  // Automatically start emulators (if enabled) + local dev server before testing
  // In CI, emulators and Vite are started by the workflow — reuseExistingServer avoids port conflicts.
  // Locally, reuseExistingServer lets Playwright start them if not already running.
  webServer: useEmulators
    ? [
        {
          command: 'npx firebase emulators:start --only auth,firestore,storage,functions',
          url: 'http://localhost:4000',
          reuseExistingServer: true,
          timeout: 60000,
          stdout: 'pipe',
        },
        {
          command: 'npm run dev',
          url: 'http://localhost:5173',
          reuseExistingServer: true,
          env: { VITE_USE_EMULATORS: 'true' },
        },
      ]
    : {
        command: 'npm run dev',
        url: 'http://localhost:5173',
        reuseExistingServer: !process.env.CI,
      },
});
