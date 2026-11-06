import { defineConfig, devices } from '@playwright/test';

const BROWSER_TEST_PORT = 4176;
const baseURL = `http://127.0.0.1:${BROWSER_TEST_PORT}`;

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: true,
  workers: process.env.CI ? 2 : 3,
  timeout: 30000,
  expect: { timeout: 10000 },
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL,
    viewport: { width: 1280, height: 900 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: `npx vite --config tests/browser/vite.config.ts --host 127.0.0.1 --port ${BROWSER_TEST_PORT} --strictPort`,
    url: `${baseURL}/tests/browser/fixture.html`,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
