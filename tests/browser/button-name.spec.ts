import { expect, test } from '@playwright/test';
import { build } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'node:path';

let html: string;
test.beforeAll(async () => {
  test.setTimeout(60_000);
  // 内存构建真实样式，只有浏览器可访问树能验证 CSS 生成文字的朗读行为。
  const result = await build({
    configFile: false,
    logLevel: 'error',
    plugins: [vue()],
    define: { 'process.env.NODE_ENV': JSON.stringify('production') },
    build: {
      write: false,
      lib: {
        entry: resolve('tests/browser/button-name-fixture.ts'),
        name: 'ButtonNames',
        formats: ['iife'],
      },
    },
  });
  const output = (Array.isArray(result) ? result : [result]).flatMap(item =>
    'output' in item ? item.output : []
  );
  const script = output.find(item => item.type === 'chunk');
  if (!script || script.type !== 'chunk') throw new Error('缺少浏览器测试脚本');
  const css = output
    .filter(item => item.type === 'asset' && item.fileName.endsWith('.css'))
    .map(item => (item.type === 'asset' ? String(item.source) : ''))
    .join('\n');
  html = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><style>${css}</style></head><body><div id="app"></div><script>${script.code}</script></body></html>`;
});

test('霓虹按钮的装饰层不会重复可访问名称，交互和语言切换后也保持正确', async ({ page }) => {
  await page.route('https://button-name.test/**', route =>
    route.fulfill({ contentType: 'text/html', body: html })
  );
  await page.goto('https://button-name.test/');
  for (const type of ['primary', 'success', 'warning', 'danger', 'info']) {
    const button = page.getByTestId(type);
    await expect(button).toHaveAccessibleName('保存');
    await button.hover();
    await expect(button).toHaveAccessibleName('保存');
    await button.focus();
    await expect(button).toHaveAccessibleName('保存');
  }
  await expect(page.getByTestId('rich')).toHaveAccessibleName('提交');
  await expect(page.getByTestId('labelled')).toHaveAccessibleName('提交订单');
  await expect(page.getByTestId('loading')).toHaveAccessibleName('保存');
  await expect(page.getByTestId('disabled')).toHaveAccessibleName('保存');
  await page.locator('#translate').click();
  await expect(page.getByTestId('primary')).toHaveAccessibleName('Save');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByTestId('primary').hover();
  await expect(page.getByTestId('primary')).toHaveAccessibleName('Save');
});
