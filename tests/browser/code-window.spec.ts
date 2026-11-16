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

test('长只读块滚动后可用鼠标跨窗口拖选', async ({ page }) => {
  const code = page.locator('#readonly-window');
  const viewport = code.locator('.ex-code__content');
  const editor = code.locator('textarea');
  await viewport.scrollIntoViewIfNeeded();
  const box = (await viewport.boundingBox())!;
  const point = { x: box.x + 125, y: box.y + 80 };
  const hit = async () =>
    page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.tagName, point);
  const selectedText = () =>
    editor.evaluate(element => {
      const textarea = element as HTMLTextAreaElement;
      return textarea.value.slice(textarea.selectionStart, textarea.selectionEnd);
    });
  expect(await hit()).toBe('TEXTAREA');
  await page.mouse.move(point.x, point.y);
  await page.mouse.down();
  await page.mouse.move(point.x + 20, point.y + 35, { steps: 3 });
  await expect.poll(async () => (await selectedText()).length).toBeGreaterThan(0);
  await viewport.evaluate(el => {
    el.scrollTop = 3000;
  });
  await expect.poll(hit).toBe('TEXTAREA');
  await page.mouse.move(point.x + 45, point.y + 120, { steps: 4 });
  await page.mouse.up();
  const lines = (await selectedText()).split('\n').length;
  expect(lines).toBeGreaterThan(40);
});

test('缩放动画结束后软换行的末尾仍与完整文本布局对齐', async ({ page }) => {
  const code = page.locator('#editable-window');
  const viewport = code.locator('.ex-code__content');
  const finalLine = code.locator('.ex-code__line').last();
  await expect(code.locator('.ex-code__line').first()).toContainText('L1');
  // 改变 transform 不会通知 ResizeObserver，已有行坐标仍需能够使用。
  await code.evaluate(el => {
    (el as HTMLElement).style.transform = 'none';
  });
  await viewport.evaluate(el => {
    el.scrollTop = el.scrollHeight;
  });
  await expect(finalLine).toContainText('L1200 最后一行');
  const position = (await finalLine.boundingBox())!;
  const mirrorBottom = await code
    .locator('.ex-code__measurement')
    .evaluate(el => el.getBoundingClientRect().bottom);
  expect(Math.abs(position.y + position.height - mirrorBottom)).toBeLessThan(2);
});

test('分数行高中部的着色行与浏览器实测文本对齐', async ({ page }) => {
  const code = page.locator('#precise-window');
  const viewport = code.locator('.ex-code__content');
  const target = 'P1250';
  await viewport.scrollIntoViewIfNeeded();
  await viewport.evaluate((element, label) => {
    const mirror = element.querySelector('.ex-code__measurement')!;
    const text = mirror.firstChild as Text;
    const start = text.data.indexOf(`${label}\n`);
    const range = document.createRange();
    range.setStart(text, start);
    range.setEnd(text, start + 1);
    element.scrollTop = range.getBoundingClientRect().top - mirror.getBoundingClientRect().top - 60;
  }, target);
  const row = code.locator('.ex-code__line-content').filter({ hasText: /^P1250$/ });
  await expect(row).toBeVisible();
  const difference = await row.evaluate((element, label) => {
    const mirror = element.closest('.ex-code__content')!.querySelector('.ex-code__measurement')!;
    const rect = (text: Text, offset: number) => {
      const range = document.createRange();
      range.setStart(text, offset);
      range.setEnd(text, offset + 1);
      return range.getBoundingClientRect();
    };
    const text = mirror.firstChild as Text;
    const rowText = [...element.childNodes].find(
      (node): node is Text => node instanceof Text && node.length > 0
    )!;
    return Math.abs(rect(rowText, 0).top - rect(text, text.data.indexOf(`${label}\n`)).top);
  }, target);
  expect(difference).toBeLessThan(2);
});

test('未换行的短文本长文件保持整行高亮和完整命中宽度', async ({ page }) => {
  const code = page.locator('#narrow-window');
  const viewport = code.locator('.ex-code__content');
  await viewport.scrollIntoViewIfNeeded();
  const highlighted = code.locator('.ex-code__line--highlighted');
  const box = (await viewport.boundingBox())!;
  const width = await viewport.evaluate(el => el.clientWidth);
  expect((await highlighted.boundingBox())!.width).toBeGreaterThanOrEqual(width - 1);
  const hit = await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.tagName, {
    x: box.x + width - 10,
    y: box.y + 18,
  });
  expect(hit).toBe('TEXTAREA');
});
