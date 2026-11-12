import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: process.env.TEST_DATA_MODE === 'api' ? '**/api.spec.ts' : '**/*.spec.ts',
  testIgnore: process.env.TEST_DATA_MODE === 'api' ? [] : ['**/api.spec.ts'],
  use: {
    channel: 'chromium',
    baseURL: process.env.TEST_BASE_URL || 'http://127.0.0.1:3000',
    trace: 'retain-on-failure',
  },
  webServer: process.env.TEST_BASE_URL
    ? undefined
    : {
        command: process.env.TEST_STATIC
          ? 'npm run preview'
          : 'npm run dev -- --hostname 127.0.0.1',
        url: 'http://127.0.0.1:3000',
        reuseExistingServer: !process.env.CI,
      },
});
