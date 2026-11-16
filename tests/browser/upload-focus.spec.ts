import { expect, test } from '@playwright/test';
import vue from '@vitejs/plugin-vue';
import { build } from 'vite';

const FIXTURE_ORIGIN = 'https://upload-focus.test';
let html: string;

test.beforeAll(async () => {
  test.setTimeout(60_000);
  const result = await build({
    configFile: false,
    logLevel: 'error',
    plugins: [vue()],
    define: { 'process.env.NODE_ENV': JSON.stringify('production') },
    build: {
      write: false,
      lib: {
        entry: 'tests/browser/upload-focus-fixture.ts',
        name: 'UploadFocus',
        formats: ['iife'],
      },
    },
  });
  const output = (Array.isArray(result) ? result : [result]).flatMap(item =>
    'output' in item ? item.output : []
  );
  const chunk = output.find(item => item.type === 'chunk');
  const css = output
    .flatMap(item => (item.type === 'asset' && item.fileName.endsWith('.css') ? [item.source] : []))
    .join('\n');
  if (chunk?.type !== 'chunk' || !css) throw new Error('缺少上传焦点验收脚本或样式');
  html = `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><style>${css}</style><body><div id="app"></div><script>${chunk.code}</script></body></html>`;
});

test('键盘焦点给文件名预览和卡片上传按钮显示轮廓', async ({ page }) => {
  await page.route(`${FIXTURE_ORIGIN}/**`, route =>
    route.fulfill({ contentType: 'text/html', body: html })
  );
  for (const theme of ['light', 'neon-blue']) {
    await page.goto(`${FIXTURE_ORIGIN}/?theme=${theme}`);
    await page.keyboard.press('Tab');
    for (const selector of [
      '.ex-file-upload--text .ex-file-upload__list-item-name',
      '.ex-file-upload--picture .ex-file-upload__list-item-name',
      '.ex-file-upload__upload-trigger-content',
    ]) {
      const button = page.locator(selector);
      await button.focus();
      await expect(button).toBeFocused();
      await expect(button).toHaveCSS('outline-style', 'solid');
      await expect(button).toHaveCSS('outline-width', '2px');
      await expect(button).toHaveCSS('outline-offset', '2px');
    }
  }
});
