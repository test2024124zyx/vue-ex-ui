import { defineConfig, devices } from '@playwright/test';

// 这些回归在内存中构建并拦截页面请求，无需启动开发服务。
export default defineConfig({
  testDir: '.',
  testMatch: ['button-name.spec.ts', 'choice-group-layout.spec.ts'],
  workers: 2,
  reporter: 'list',
  projects: [
    { name: 'chromium', use: devices['Desktop Chrome'] },
    { name: 'firefox', use: devices['Desktop Firefox'] },
  ],
});
