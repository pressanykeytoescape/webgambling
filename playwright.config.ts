import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  webServer: {
    command: 'npm run dev',
    port: 4200,
    timeout: 120 * 1000,
    reuseExistingServer: true,
  },
  use: {
    headless: true,
    viewport: { width: 1280, height: 800 },
    baseURL: 'http://localhost:4200',
  },
});