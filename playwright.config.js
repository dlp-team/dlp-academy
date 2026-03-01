import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
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
  // Automatically start your local dev server before testing
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
