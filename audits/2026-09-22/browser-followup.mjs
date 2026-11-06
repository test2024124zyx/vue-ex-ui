import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { preview } from 'vite';
import { chromium } from '../../benchmarks/ui-comparison/node_modules/playwright/index.mjs';

const output = resolve(import.meta.dirname, '../../.tmp/system-audit-2026-09-22/browser');
const server = await preview({
  root: import.meta.dirname,
  configFile: false,
  build: {
    outDir: resolve(
      import.meta.dirname,
      '../../benchmarks/ui-comparison/dist/audit-chromium-20260922'
    ),
  },
  preview: { host: '127.0.0.1', port: 0 },
});
const browser = await chromium.launch({ headless: true, channel: 'chromium' });
const results = [];
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(server.resolvedUrls.local[0]);
  await page.waitForFunction(() => window.__audit);
  await page.evaluate(() => window.__audit.mount('focus'));
  await page.locator('#opener').click();
  await page.waitForTimeout(100);
  // 对照只改变测试页面的禁用表达，证明失效来自 fieldset 的继承语义。
  await page.locator('fieldset').evaluate(element => {
    element.disabled = false;
    element.querySelector('input').disabled = true;
  });
  await page.locator('#valid-last').focus();
  await page.keyboard.press('Tab');
  const activeId = await page.evaluate(() => document.activeElement.id);
  assert.equal(activeId, 'valid-first');
  results.push({ kind: 'focus-control', activeId, passed: true });

  for (const immutable of [false, true]) {
    await page.evaluate(
      immutable => window.__audit.mount('table', { rows: 1000, immutable }),
      immutable
    );
    await page.evaluate(() => window.__audit.updateRow());
    assert.equal(await page.getByText('更新后的记录', { exact: true }).count(), 1);
    results.push({ kind: 'immutable', immutable, passed: true });
  }

  await page.evaluate(() => window.__audit.mount('form', { theme: 'light' }));
  await page.locator('input').fill('主题切换保留值');
  await page.evaluate(() => window.__audit.patch({ theme: 'neon-blue' }));
  assert.equal(await page.locator('input').inputValue(), '主题切换保留值');
  assert.equal(await page.locator('.ex-config-provider').getAttribute('data-theme'), 'neon-blue');
  results.push({ kind: 'theme-value-preservation', passed: true });

  for (const width of [375, 320]) {
    await page.setViewportSize({ width, height: 812 });
    await page.evaluate(() => window.__audit.mount('pagination'));
    const dimensions = await page.evaluate(() => {
      document.body.style.margin = '0';
      document.querySelector('main').style.padding = '0';
      return { width: innerWidth, scrollWidth: document.documentElement.scrollWidth };
    });
    results.push({
      kind: 'pagination-zero-padding',
      ...dimensions,
      passed: dimensions.scrollWidth <= dimensions.width,
    });
    await page.screenshot({
      path: resolve(output, `pagination-${width}-zero-padding.png`),
      fullPage: true,
    });
  }
} finally {
  await writeFile(resolve(output, 'followup.json'), JSON.stringify(results, null, 2));
  await browser.close();
  await new Promise(resolve => server.httpServer.close(resolve));
}
process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
process.exitCode = results.some(result => !result.passed) ? 1 : 0;
