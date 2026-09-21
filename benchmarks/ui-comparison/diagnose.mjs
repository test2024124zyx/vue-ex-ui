import { build } from 'vite';
import { chromium } from 'playwright';
import { resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { mkdir, writeFile } from 'node:fs/promises';
import { serve } from './server.mjs';
import { CONFIG } from './workload.mjs';

const root = import.meta.dirname;
const { values } = parseArgs({ options: { output: { type: 'string', default: 'diagnostics' } } });
const output = resolve(root, 'results', values.output);
await mkdir(output, { recursive: true });
const records = [];
// 诊断单独构建运行，调用计数和 CSS 覆盖采集不进入正式性能数据。
for (const library of ['exui', 'element', 'naive', 'ant']) {
  await build({ root, configFile: false, logLevel: 'error', base: `/probe-${library}/`,
    resolve: { alias: { '@adapter': resolve(root, `adapters/${library}.mjs`), vue: resolve(root, 'node_modules/vue/dist/vue.runtime.esm-bundler.js') } },
    build: { outDir: resolve(root, `dist/probe-${library}`), emptyOutDir: true, target: 'es2020',
      rollupOptions: { input: resolve(root, 'probe.html') } },
  });
}
const server = await serve();
const browser = await chromium.launch();
const browserSession = await browser.newBrowserCDPSession();
const graphics = await browserSession.send('SystemInfo.getInfo');
try {
  for (const library of ['exui', 'element', 'naive', 'ant']) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    for (const virtual of [false, true]) {
      if (virtual && library === 'ant') continue;
      await page.goto(`${server.origin}/probe-${library}/probe.html?count=${virtual ? CONFIG.virtualRows : CONFIG.totalRows}&virtual=${virtual ? 1 : 0}`);
      await page.waitForFunction(() => window.__probeReady);
      const initial = await page.evaluate(() => window.__probeReady);
      const update = await page.evaluate(() => window.__probe.updateOne());
      records.push({ library, virtual, initial, update });
    }
    await page.close();
  }
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('DOM.enable');
  await cdp.send('CSS.enable');
  await cdp.send('CSS.startRuleUsageTracking');
  const sheets = new Map();
  cdp.on('CSS.styleSheetAdded', ({ header }) => sheets.set(header.styleSheetId, header));
  await page.goto(`${server.origin}/exui/?mode=page`);
  await page.waitForFunction(() => window.__ready);
  await page.evaluate(() => window.__bench.open());
  await page.waitForTimeout(400);
  await page.evaluate(() => window.__bench.validate());
  await page.waitForTimeout(400);
  const coverage = await cdp.send('CSS.stopRuleUsageTracking');
  const css = [];
  for (const [id, header] of sheets) {
    const { text } = await cdp.send('CSS.getStyleSheetText', { styleSheetId: id });
    const rules = coverage.ruleUsage.filter(rule => rule.styleSheetId === id);
    css.push({ url: header.sourceURL, bytes: Buffer.byteLength(text), measuredRuleBytes: rules.reduce((sum, rule) => sum + rule.endOffset - rule.startOffset, 0),
      usedRuleBytes: rules.filter(rule => rule.used).reduce((sum, rule) => sum + rule.endOffset - rule.startOffset, 0), rules: rules.length });
  }

  // 复现输入失焦和提交同一次点击时，记录事件目标与按钮位置变化。
  await page.evaluate(() => window.__bench.fill(true));
  await page.locator('.form-grid input').first().fill('人工输入订单资料');
  await page.evaluate(() => {
    window.__clickTrace = [];
    for (const type of ['pointerdown', 'pointerup', 'click', 'blur']) document.addEventListener(type, event => {
      const button = document.querySelector('[data-action="validate"]');
      window.__clickTrace.push({ type, target: event.target.tagName, className: event.target.className,
        action: event.target.closest('[data-action]')?.getAttribute('data-action'),
        buttonTop: button.getBoundingClientRect().top, x: event.clientX, y: event.clientY });
    }, true);
  });
  const before = await page.evaluate(() => window.__bench.snapshot().measurements.filter(item => item.name === 'validate').length);
  await page.locator('[data-action="validate"]').click();
  await page.waitForTimeout(1000);
  const click = await page.evaluate(() => ({ events: window.__clickTrace, snapshot: window.__bench.snapshot() }));
  const after = click.snapshot.measurements.filter(item => item.name === 'validate').length;
  await writeFile(resolve(output, 'diagnostics.json'), JSON.stringify({ graphics, tableRenderCalls: records, cssCoverage: css,
    blurClick: { before, after, ...click } }, null, 2));
  process.stdout.write(`${JSON.stringify({ tableRenderCalls: records, cssCoverage: css, blurClick: { before, after, events: click.events } }, null, 2)}\n`);
} finally { await browser.close(); await server.close(); }
