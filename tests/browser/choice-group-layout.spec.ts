import { expect, test } from '@playwright/test';
import { build } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'node:path';

const FIXTURE_ORIGIN = 'https://choice-layout.test';
const BUILD_TIMEOUT_MS = 60_000;
let fixtureHtml: string;

test.beforeAll(async () => {
  test.setTimeout(BUILD_TIMEOUT_MS);
  // 在内存中构建真实组件和样式，避免开发服务器及外部字体影响布局测量。
  const result = await build({
    configFile: false,
    logLevel: 'error',
    plugins: [vue()],
    define: { 'process.env.NODE_ENV': JSON.stringify('production') },
    build: {
      write: false,
      lib: {
        entry: resolve('tests/browser/choice-group-layout-fixture.ts'),
        name: 'ChoiceLayoutFixture',
        formats: ['iife'],
      },
    },
  });
  const outputs = (Array.isArray(result) ? result : [result]).flatMap(result =>
    'output' in result ? result.output : []
  );
  const script = outputs.find(output => output.type === 'chunk');
  const styles = outputs.filter(
    output => output.type === 'asset' && output.fileName.endsWith('.css')
  );
  if (script?.type !== 'chunk' || styles.length === 0)
    throw new Error('布局验收缺少组件脚本或样式');
  fixtureHtml = `<!doctype html><html><head><meta charset="utf-8"><style>
    body { margin: 0; } ${styles.map(style => (style.type === 'asset' ? String(style.source) : '')).join('\n')}
    </style></head><body><div id="app"></div><script>${script.code}</script></body></html>`;
});

for (const kind of ['radio', 'checkbox'] as const) {
  for (const size of ['small', 'medium', 'large']) {
    test(`${kind} ${size} 在首屏、换行、纵向和屏外布局中保持后续内容稳定`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.route(`${FIXTURE_ORIGIN}/**`, route =>
        route.fulfill({ contentType: 'text/html', body: fixtureHtml })
      );
      for (const layout of ['inline', 'vertical', 'wrap', 'offscreen']) {
        await page.setViewportSize({ width: layout === 'wrap' ? 320 : 869, height: 1066 });
        await page.goto(`${FIXTURE_ORIGIN}/?kind=${kind}&size=${size}&layout=${layout}`);
        expect(errors).toEqual([]);
        await page.waitForFunction(() => window.choiceLayout.ready);
        const content = page.locator(`.ex-${kind}-group__content`);
        if (layout === 'offscreen') await content.scrollIntoViewIfNeeded();
        await expect(content.locator('label').first()).toBeVisible();
        const position = await page.evaluate(() => ({
          initial: window.choiceLayout.initialFooterTop,
          current: document.querySelector<HTMLElement>('#following-content')!.offsetTop,
        }));
        expect(position.current).toBe(position.initial);
        await expect(content).toHaveCSS('content-visibility', 'visible');
        await content.locator('label').nth(1).click();
        await expect(page.getByRole(kind).nth(1)).toBeChecked();
      }
      expect(errors).toEqual([]);
    });
  }
}
