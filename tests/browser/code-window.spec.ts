import { expect, test } from '@playwright/test';
import { build } from 'vite';
import vue from '@vitejs/plugin-vue';

const FIXTURE_ORIGIN = 'https://code-window.test';
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
        entry: 'tests/browser/code-window-fixture.ts',
        name: 'CodeWindowTest',
        formats: ['iife'],
      },
    },
  });
  const outputs = (Array.isArray(result) ? result : [result]).flatMap(item =>
    'output' in item ? item.output : []
  );
  const chunk = outputs.find(item => item.type === 'chunk');
  const style = outputs.find(item => item.type === 'asset' && item.fileName.endsWith('.css'));
  if (chunk?.type !== 'chunk' || style?.type !== 'asset') throw new Error('缺少代码视口验收资源');
  html = `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><style>${style.source}</style><div id="app"></div><script>${chunk.code}</script></html>`;
});

test.beforeEach(async ({ page }) => {
  await page.route(`${FIXTURE_ORIGIN}/**`, route =>
    route.fulfill({ contentType: 'text/html', body: html })
  );
  await page.goto(FIXTURE_ORIGIN);
});

test('长只读块仅绘制可见行，横向和纵向可到达全文', async ({ page }) => {
  const code = page.locator('#readonly-window');
  const viewport = code.locator('.ex-code__content');
  const displayed = code.locator('.ex-code__line');
  const editor = code.locator('textarea');
  await expect(displayed.first()).toContainText('L1');
  expect(await displayed.count()).toBeLessThan(60);
  expect(await viewport.evaluate(el => el.scrollWidth)).toBeGreaterThan(
    await viewport.evaluate(el => el.clientWidth)
  );
  const text = await editor.inputValue();
  expect(text.split('\n')).toHaveLength(1200);
  expect(text.endsWith('L1200 最后一行')).toBe(true);
  await viewport.evaluate(el => {
    el.scrollTop = el.scrollHeight;
  });
  await expect(displayed.last()).toContainText('L1200 最后一行');
  expect(await displayed.count()).toBeLessThan(60);
});

test('软换行的长编辑器保留视口、实际行号与键盘光标', async ({ page }) => {
  const code = page.locator('#editable-window');
  const viewport = code.locator('.ex-code__content');
  const editor = code.locator('textarea');
  const displayed = code.locator('.ex-code__line');
  await expect(displayed.first()).toContainText('L1');
  expect((await displayed.first().boundingBox())!.height).toBeGreaterThan(
    (await displayed.nth(1).boundingBox())!.height
  );
  expect((await viewport.boundingBox())!.height).toBeLessThanOrEqual(200);
  await editor.focus();
  await editor.press('Control+End');
  await expect(displayed.last()).toContainText('L1200 最后一行');
  await editor.press('End');
  await editor.press('!');
  await expect(editor).toHaveValue(/L1200 最后一行!$/);
  await expect(displayed.last()).toContainText('L1200 最后一行!');
  expect(await displayed.count()).toBeLessThan(60);
});
