import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { cpus, release } from 'node:os';
import { execFileSync } from 'node:child_process';
import { build, preview } from 'vite';
import {
  chromium,
  firefox,
  webkit,
} from '../../benchmarks/ui-comparison/node_modules/playwright/index.mjs';

const root = resolve(import.meta.dirname, '../..');
const engine = process.env.AUDIT_BROWSER ?? 'chromium';
const browserType = { chromium, firefox, webkit }[engine];
assert.ok(browserType, `未知浏览器引擎：${engine}`);
const output = resolve(
  root,
  `.tmp/system-audit-2026-09-22/browser${engine === 'chromium' ? '' : `-${engine}`}`
);
// 消费产物归入仓库既有基准构建目录，避免源码 lint 扫描压缩后的依赖代码。
const buildDirectory = resolve(root, `benchmarks/ui-comparison/dist/audit-${engine}-20260922`);
const ACTION_TIMEOUT = 10000;
const SETTLE_MS = 100;
const CYCLES = 30;
const PERFORMANCE_ROUNDS = 3;
await mkdir(output, { recursive: true });
await build({
  root: import.meta.dirname,
  configFile: false,
  logLevel: 'warn',
  build: { outDir: buildDirectory, emptyOutDir: true, target: 'es2020' },
});
const server = await preview({
  root: import.meta.dirname,
  configFile: false,
  build: { outDir: buildDirectory },
  preview: { host: '127.0.0.1', port: 0 },
});
const origin = server.resolvedUrls.local[0];
const browser = await browserType.launch({
  headless: true,
  ...(engine === 'chromium' ? { channel: 'chromium' } : {}),
});
const results = [];
const performanceSamples = [];
const resourceSamples = [];
const consoleErrors = [];
const manifest = {
  revision: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
  sourceRevision: '289cd707c0b334959fa5062af55183193fcc2e60',
  startedAt: new Date().toISOString(),
  os: release(),
  cpu: cpus()[0].model,
  node: process.version,
  engine,
  browser: browser.version(),
  viewport: { width: 1280, height: 900 },
  dpr: 1,
  mode: 'production',
  cycles: CYCLES,
  performanceRounds: PERFORMANCE_ROUNDS,
  timing: 'mount includes Vue nextTick; paintOpportunity adds two rAF; not field INP',
};
const context = await browser.newContext({ viewport: manifest.viewport, deviceScaleFactor: 1 });
const page = await context.newPage();
page.setDefaultTimeout(ACTION_TIMEOUT);
page.on('pageerror', error => consoleErrors.push(String(error)));
await page.goto(origin);
await page.waitForFunction(() => window.__audit);
const cdp = engine === 'chromium' ? await context.newCDPSession(page) : null;
const mount = (scene, config = {}) =>
  page.evaluate(([scene, config]) => window.__audit.mount(scene, config), [scene, config]);
const snap = () => page.evaluate(() => window.__audit.snapshot());
const active = () => page.evaluate(() => document.activeElement?.id);

async function check(id, name, run) {
  try {
    const evidence = await run();
    results.push({ id, name, status: 'passed', evidence });
    process.stdout.write(`PASS ${id} ${name}\n`);
  } catch (error) {
    const screenshot = resolve(output, `${id}.png`);
    await page.screenshot({ path: screenshot, fullPage: true }).catch(() => {});
    results.push({ id, name, status: 'failed', error: String(error), screenshot });
    process.stdout.write(`FAIL ${id} ${name}: ${String(error)}\n`);
  }
}

async function resources(label) {
  if (cdp) await cdp.send('HeapProfiler.collectGarbage');
  const heap = cdp ? await cdp.send('Runtime.getHeapUsage') : {};
  const dom = cdp ? await cdp.send('Memory.getDOMCounters') : {};
  resourceSamples.push({
    label,
    heapAvailable: Boolean(cdp),
    ...heap,
    ...dom,
    connected: await page.locator('*').count(),
    overflow: await page.evaluate(() => document.body.style.overflow),
  });
}

try {
  for (const kind of ['modal', 'dialog', 'drawer']) {
    await check(`FOCUS-${kind}`, `${kind} 跳过原生停用 fieldset`, async () => {
      await mount('focus', { kind });
      await page.locator('#opener').click();
      await page.waitForTimeout(SETTLE_MS);
      await page.locator('#valid-last').focus();
      await page.keyboard.press('Tab');
      const actual = await active();
      assert.equal(actual, 'valid-first', `Tab 后焦点实际为 ${actual}`);
      return { active: actual };
    });
  }

  // 三个布尔维度完整执行八种组合，严格强于该小范围内的两两覆盖。
  for (const virtual of [false, true])
    for (const multiple of [false, true])
      for (const searchable of [false, true]) {
        await check(
          `NEST-${Number(virtual)}${Number(multiple)}${Number(searchable)}`,
          'Modal × Select 键盘与 Escape',
          async () => {
            await mount('overlay', { virtual, multiple, searchable });
            // WebKit 鼠标按下会取消按钮焦点；键盘打开用于明确验证恢复原焦点契约。
            await page.locator('#opener').focus();
            await page.locator('#opener').press('Enter');
            const combo = page.getByRole('combobox');
            await combo.click();
            await page.keyboard.press('ArrowDown');
            await page.keyboard.press('Enter');
            const selected = (await snap()).value;
            assert.ok(
              multiple ? selected?.length > 0 : selected !== undefined,
              '键盘选择必须产生值'
            );
            if ((await combo.getAttribute('aria-expanded')) !== 'true') await combo.click();
            await page.keyboard.press('Escape');
            assert.equal((await snap()).open, true, '首次 Escape 应保留父弹窗');
            await page.keyboard.press('Escape');
            assert.equal((await snap()).open, false);
            assert.equal(await active(), 'opener');
            assert.equal(await page.evaluate(() => document.body.style.overflow), '');
            return { virtual, multiple, searchable, selected };
          }
        );
      }

  await check('IME', '组合输入只提交完成值（合成事件）', async () => {
    await mount('input');
    const observed = await page.locator('#app input').evaluate(element => {
      element.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
      element.value = 'zhong';
      element.dispatchEvent(
        new InputEvent('input', { bubbles: true, isComposing: true, data: 'zhong' })
      );
      const during = window.__audit.snapshot().inputEvents;
      element.value = '中';
      element.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: '中' }));
      return { during, after: window.__audit.snapshot().inputEvents };
    });
    assert.deepEqual(observed, { during: [], after: ['中'] });
    return observed;
  });

  await check('LOCALE', '中文 Provider 默认必填错误', async () => {
    await mount('form', { locale: 'zh-CN' });
    await page.locator('#validate').click();
    const actual = await page.locator('.ex-form-item__error').innerText();
    assert.equal(actual, '此字段为必填项');
    return actual;
  });

  await check('COMPAT-AT', '缺失 Array.at 时表单重置仍可用（能力注入）', async () => {
    await mount('form');
    await page.locator('input').fill('已修改');
    const observed = await page.evaluate(() => {
      const descriptor = Object.getOwnPropertyDescriptor(Array.prototype, 'at');
      try {
        Object.defineProperty(Array.prototype, 'at', { value: undefined, configurable: true });
        window.__audit.reset();
        return { value: window.__audit.snapshot().input };
      } catch (error) {
        return { error: String(error) };
      } finally {
        Object.defineProperty(Array.prototype, 'at', descriptor);
      }
    });
    assert.deepEqual(observed, { value: '' });
    return observed;
  });

  const payloads = [
    '<img src="data:image/png;base64,AAAA" onerror="window.auditExecuted=true">',
    '<svg><g onload="window.auditExecuted=true"></g></svg>',
    '<a href="java&#x09;script:window.auditExecuted=true">链接</a>',
    '<math><mtext><table><mglyph><style><!--</style><img title="--><img src=x onerror=window.auditExecuted=true>">',
    '<noscript><p title="</noscript><img src=x onerror=window.auditExecuted=true>">',
    '<iframe srcdoc="<script>parent.auditExecuted=true</script>"></iframe>',
  ];
  await check('HTML-SECURITY', '真实浏览器解析六组本地恶意 HTML', async () => {
    const observations = [];
    for (const html of payloads) {
      await page.evaluate(() => {
        window.auditExecuted = false;
      });
      await mount('security', { html });
      await page.waitForTimeout(SETTLE_MS);
      const result = await page.evaluate(() => ({
        executed: window.auditExecuted,
        dangerous: document.querySelectorAll(
          '#app [onerror], #app [onload], #app iframe, #app script'
        ).length,
        cleaned: window.__audit.sanitizeHtml(document.querySelector('#app').innerHTML),
      }));
      assert.equal(result.executed, false);
      assert.equal(result.dangerous, 0);
      observations.push({ html, ...result });
    }
    return observations;
  });

  // 性能样本只在构建完成后串行采集；每种规模三次，不据此给出总体 p95。
  for (const count of [100, 1000, 10000])
    for (const virtual of [false, true]) {
      if (count === 10000 && !virtual) continue;
      await check(`TABLE-${count}-${virtual}`, '表格生产渲染、更新和末行可达', async () => {
        for (let round = 0; round < PERFORMANCE_ROUNDS; round++) {
          await page.evaluate(() => window.__audit.unmount());
          const sample = await page.evaluate(
            async ({ count, virtual }) => {
              const start = performance.now();
              await window.__audit.mount('table', { rows: count, virtual });
              const commitMs = performance.now() - start;
              await new Promise(resolve =>
                requestAnimationFrame(() => requestAnimationFrame(resolve))
              );
              const paintOpportunityMs = performance.now() - start;
              const updateStart = performance.now();
              await window.__audit.updateRow();
              return {
                commitMs,
                paintOpportunityMs,
                updateMs: performance.now() - updateStart,
                renderedRows: document.querySelectorAll('.ex-table__row').length,
              };
            },
            { count, virtual }
          );
          assert.ok(await page.getByText('更新后的记录', { exact: true }).count());
          performanceSamples.push({ count, virtual, round, ...sample });
        }
        const scroll = await page.locator('.ex-table__container').evaluate(element => {
          element.scrollTop = element.scrollHeight;
          return { height: element.scrollHeight, viewport: element.clientHeight };
        });
        await page.waitForTimeout(SETTLE_MS);
        assert.ok(
          await page.getByText(`记录 ${count}`, { exact: true }).count(),
          '必须出现最后一行'
        );
        if (virtual) assert.ok((await page.locator('.ex-table__row').count()) < 40);
        return scroll;
      });
    }

  await check('RESOURCES', '三十次弹层挂载卸载与资源回收', async () => {
    await page.evaluate(() => window.__audit.unmount());
    await resources('initial');
    for (let cycle = 1; cycle <= CYCLES; cycle++) {
      await mount('overlay');
      await page.locator('#opener').click();
      await page.getByRole('combobox').click();
      await page.evaluate(() => window.__audit.unmount());
      assert.equal(await page.locator('[role="dialog"], [role="listbox"]').count(), 0);
      assert.equal(await page.evaluate(() => document.body.style.overflow), '');
      if (cycle % 10 === 0) await resources(`cycle-${cycle}`);
    }
    return resourceSamples;
  });

  const axeSource = await readFile(
    resolve(root, '.tmp/system-audit-2026-09-22/tools/node_modules/axe-core/axe.min.js'),
    'utf8'
  );
  for (const theme of ['light', 'neon-blue']) {
    await check(`AXE-${theme}`, '代表性控件页面 WCAG A/AA 自动检查', async () => {
      await mount('gallery', { theme });
      await page.addScriptTag({ content: axeSource });
      const result = await page.evaluate(() =>
        window.axe.run('main', {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] },
        })
      );
      await writeFile(resolve(output, `axe-${theme}.json`), JSON.stringify(result, null, 2));
      await page.screenshot({ path: resolve(output, `gallery-${theme}.png`), fullPage: true });
      assert.equal(
        result.violations.length,
        0,
        JSON.stringify(
          result.violations.map(item => ({
            id: item.id,
            impact: item.impact,
            nodes: item.nodes.map(node => node.target),
          }))
        )
      );
      return {
        axe: result.testEngine,
        passes: result.passes.length,
        incomplete: result.incomplete.length,
      };
    });
  }
  await check('NARROW', '375px 视口下代表性控件无页面横向溢出', async () => {
    await page.setViewportSize({ width: 375, height: 812 });
    await mount('gallery');
    await page.screenshot({ path: resolve(output, 'gallery-mobile.png'), fullPage: true });
    const dimensions = await page.evaluate(() => ({
      width: innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      overflowing: [...document.querySelectorAll('main *')]
        .filter(element => element.getBoundingClientRect().right > innerWidth)
        .map(element => ({
          tag: element.tagName,
          class: element.className,
          right: element.getBoundingClientRect().right,
        })),
    }));
    assert.ok(dimensions.scrollWidth <= dimensions.width, JSON.stringify(dimensions));
    return dimensions;
  });
  await check('PAGINATION-NARROW', '独立分页器在 375px 视口下无页面横向溢出', async () => {
    await mount('pagination');
    const dimensions = await page.evaluate(() => ({
      width: innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    assert.ok(dimensions.scrollWidth <= dimensions.width, JSON.stringify(dimensions));
    return dimensions;
  });
} finally {
  await writeFile(
    resolve(output, 'results.json'),
    JSON.stringify(
      { manifest, results, performanceSamples, resourceSamples, consoleErrors },
      null,
      2
    )
  );
  await context.close();
  await browser.close();
  await new Promise(resolve => server.httpServer.close(resolve));
}
process.exitCode = results.some(result => result.status === 'failed') ? 1 : 0;
