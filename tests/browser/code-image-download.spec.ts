import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { build } from 'vite';
import vue from '@vitejs/plugin-vue';

const FIXTURE_ORIGIN = 'https://code-image-download.test';
let html: string;

test.beforeAll(async () => {
  test.setTimeout(60_000);
  // 内存构建组件，通过 Playwright 路由提供测试页。
  const result = await build({
    configFile: false,
    logLevel: 'error',
    plugins: [vue()],
    define: { 'process.env.NODE_ENV': JSON.stringify('production') },
    build: {
      write: false,
      lib: {
        entry: 'tests/browser/code-image-download-fixture.ts',
        name: 'CodeImageDownloads',
        formats: ['iife'],
      },
    },
  });
  const chunk = (Array.isArray(result) ? result : [result])
    .flatMap(item => ('output' in item ? item.output : []))
    .find(item => item.type === 'chunk');
  if (chunk?.type !== 'chunk') throw new Error('缺少下载验收脚本');
  html = `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><body><div id="app"></div><script>${chunk.code}</script></body></html>`;
});

test('条码和二维码从公开方法下载有效的 PNG', async ({ page }) => {
  await page.route(`${FIXTURE_ORIGIN}/**`, route =>
    route.fulfill({ contentType: 'text/html', body: html })
  );
  await page.goto(FIXTURE_ORIGIN);
  for (const [label, filename] of [
    ['下载条码', 'barcode.png'],
    ['下载二维码', 'qrcode.png'],
  ] as const) {
    const button = page.getByRole('button', { name: label, exact: true });
    await expect(button).toBeEnabled();
    const [download] = await Promise.all([page.waitForEvent('download'), button.click()]);
    expect(download.suggestedFilename()).toBe(filename);
    const bytes = await readFile((await download.path())!);
    expect(bytes.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
  }
  await expect(page.locator('a[download]')).toHaveCount(0);
});
