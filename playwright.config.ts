import { defineConfig } from '@playwright/test';

export default defineConfig({
  timeout: 30000,
  testDir: './tests',
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    screenshot: 'only-on-failure',
    video: 'off'
  },
  webServer: {
    command: 'npm run preview',
    port: 4173,
    reuseExistingServer: true,
    timeout: 60000
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } }
  ]
});
