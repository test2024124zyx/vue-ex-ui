import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { cpus, totalmem, release } from 'node:os';
import { parseArgs } from 'node:util';
import { execFileSync } from 'node:child_process';
import { serve } from './server.mjs';
import { CONFIG, summarize } from './workload.mjs';

const { values } = parseArgs({ options: {
  rounds: { type: 'string', default: '5' },
  libraries: { type: 'string', default: 'exui,element,naive,ant' },
  modes: { type: 'string', default: 'page,full,virtual' },
  throttle: { type: 'string', default: '1' },
  cycles: { type: 'string', default: String(CONFIG.cycles) },
  output: { type: 'string', default: 'baseline' },
  theme: { type: 'string', default: 'light' },
  profile: { type: 'boolean', default: false },
  network: { type: 'string', default: 'local' },
  browser: { type: 'string', default: 'chromium' },
} });
const rounds = Number(values.rounds);
const cycleCount = Number(values.cycles);
const libraries = values.libraries.split(',');
const modes = values.modes.split(',');
const TRANSITION_WAIT = 400;
const ACTION_TIMEOUT = 30000;
const output = resolve(import.meta.dirname, 'results', values.output);
await mkdir(output, { recursive: true });
const server = await serve();
const browser = await chromium.launch({ headless: true, channel: values.browser === 'shell' ? undefined : 'chromium' });
const browserSession = await browser.newBrowserCDPSession();
const graphics = await browserSession.send('SystemInfo.getInfo');
const results = [];
const failures = [];
const manifest = {
  startedAt: new Date().toISOString(), revision: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  os: `Windows ${release()}`, cpu: cpus()[0].model, logicalCpus: cpus().length,
  memoryGiB: totalmem() / 1024 ** 3, node: process.version, chromium: browser.version(),
  browserMode: values.browser, graphics,
  viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1,
  cpuThrottle: Number(values.throttle), rounds, cycleCount, theme: values.theme,
  network: values.network === 'fast3g' ? { latencyMs: 150, downloadBitsPerSecond: 1600000, uploadBitsPerSecond: 750000 } : 'localhost unthrottled',
  cache: 'cold browser context, gzip localhost; warm reload measured separately',
  timing: 'commitMs includes Vue nextTick; paintMs uses two rAF and is a paint opportunity proxy, not field INP',
  dependencies: JSON.parse(await readFile(resolve(import.meta.dirname, 'package.json'), 'utf8')).dependencies,
  workload: CONFIG,
};

function metricMap(result) { return Object.fromEntries(result.metrics.map(item => [item.name, item.value])); }
async function heap(cdp, page) {
  await cdp.send('HeapProfiler.collectGarbage');
  const usage = await cdp.send('Runtime.getHeapUsage');
  const counters = await cdp.send('Memory.getDOMCounters');
  return { ...usage, ...counters, connectedElements: await page.locator('*').count() };
}
async function waitMeasurement(page, name, previous) {
  await page.waitForFunction(({ name, previous }) => window.__bench.snapshot().measurements.filter(item => item.name === name).length > previous,
    { name, previous }, { timeout: ACTION_TIMEOUT });
}
async function clickAction(page, action, metric) {
  const previous = await page.evaluate(name => window.__bench.snapshot().measurements.filter(item => item.name === name).length, metric);
  await page.locator(`[data-action="${action}"]`).click();
  await waitMeasurement(page, metric, previous);
}
async function snapshot(page) { return page.evaluate(() => window.__bench.snapshot()); }
async function verifyTable(page, mode, expected) {
  const count = await page.locator('[data-table]').evaluate(element => (element.innerText.match(/客户 \d{5}/g) || []).length);
  assert.ok(mode === 'virtual' ? count > 0 && count < 100 : count === expected, `表格实际客户行数错误：${count}/${expected}`);
  return count;
}
async function scrollTest(page) {
  return page.evaluate(async () => {
    const table = document.querySelector('[data-table]');
    const elements = [...table.querySelectorAll('*')].filter(element => {
      const style = getComputedStyle(element);
      return /(auto|scroll|hidden)/.test(style.overflowY) && element.scrollHeight > element.clientHeight + 100 && element.clientHeight > 100;
    });
    const scroller = elements.sort((a, b) => (b.scrollHeight - b.clientHeight) - (a.scrollHeight - a.clientHeight))[0];
    if (!scroller) throw new Error('没有可滚动表格，拒绝记录空操作');
    const durations = [];
    const frames = 60;
    let previous = performance.now();
    for (let index = 0; index < frames; index++) {
      scroller.scrollTop = (scroller.scrollHeight - scroller.clientHeight) * index / (frames - 1);
      await new Promise(resolve => requestAnimationFrame(resolve));
      const now = performance.now();
      durations.push(now - previous);
      previous = now;
    }
    await new Promise(resolve => requestAnimationFrame(resolve));
    const bottomText = table.innerText;
    const finalScrollTop = scroller.scrollTop;
    scroller.scrollTop = 0;
    await new Promise(resolve => requestAnimationFrame(resolve));
    await new Promise(resolve => requestAnimationFrame(resolve));
    return { durations, finalScrollTop, bottomText: bottomText.slice(-1500), slowFrames: durations.filter(value => value > 25).length };
  });
}

async function runCase(library, mode, round) {
  const context = await browser.newContext({ viewport: manifest.viewport, deviceScaleFactor: 1, locale: 'zh-CN' });
  const page = await context.newPage();
  page.setDefaultTimeout(ACTION_TIMEOUT);
  const errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  const cdp = await context.newCDPSession(page);
  await cdp.send('Performance.enable');
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: manifest.cpuThrottle });
  if (values.network === 'fast3g') {
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150,
      downloadThroughput: 1600000 / 8, uploadThroughput: 750000 / 8 });
  }
  const record = { library, mode, round, errors };
  try {
    if (values.profile) { await cdp.send('Profiler.enable'); await cdp.send('Profiler.start'); }
    await page.goto(`${server.origin}/${library}/?mode=${mode}&theme=${values.theme}`, { waitUntil: 'load' });
    await page.waitForFunction(() => window.__ready);
    record.initial = await page.evaluate(() => ({ ...window.__ready, observer: JSON.parse(JSON.stringify(window.__observed)),
      resources: performance.getEntriesByType('resource').map(entry => entry.toJSON()),
      navigation: performance.getEntriesByType('navigation')[0].toJSON(), elements: document.querySelectorAll('*').length }));
    record.startMetrics = metricMap(await cdp.send('Performance.getMetrics'));
    record.renderedRows = await verifyTable(page, mode, mode === 'page' ? CONFIG.pageSize : CONFIG.totalRows);
    if (round === 0) await page.screenshot({ path: resolve(output, `${library}-${mode}.png`), fullPage: true });

    process.stdout.write(`${library}/${mode}/${round}: 校验排序、筛选和选择\n`);
    await clickAction(page, 'sort', 'sort');
    let current = await snapshot(page);
    assert.equal(current.first.amount, Math.min(...Array.from({ length: mode === 'virtual' ? CONFIG.virtualRows : CONFIG.totalRows }, (_, index) => ((index * 7919) % 100003) + 100)));
    assert.ok(await page.locator('[data-table]').innerText().then(text => text.includes(current.first.customer)));
    await page.evaluate(() => window.__bench.filter('客户 000'));
    assert.equal((await snapshot(page)).total, 99);
    await verifyTable(page, mode, 99);
    await page.evaluate(() => window.__bench.filter(''));
    if (mode === 'page') {
      await clickAction(page, 'page', 'page');
      assert.equal((await snapshot(page)).visibleData, CONFIG.pageSize);
      await clickAction(page, 'page', 'page');
    }
    const checkboxSelector = { exui: '.ex-checkbox', element: '.el-checkbox', naive: '.n-checkbox', ant: '.ant-checkbox-wrapper' }[library];
    await page.locator(`[data-table] ${checkboxSelector}`).first().click();
    assert.equal((await snapshot(page)).selected.length, 1);
    await page.evaluate(() => window.__bench.select());
    assert.equal((await snapshot(page)).selected.length, 0);
    await clickAction(page, 'update', 'update');
    // 改为降序后滚到底部，验证虚拟表格确实能到达最后一条业务数据。
    await page.evaluate(() => window.__bench.sort());
    record.scroll = await scrollTest(page);
    assert.ok(record.scroll.finalScrollTop > 0);
    assert.ok(record.scroll.bottomText.includes((await snapshot(page)).last.customer), '滚动到底部后缺少最后一条业务记录');

    await page.locator('.search input').fill('客户 000');
    await page.waitForFunction(() => window.__bench.snapshot().total === 99);
    await page.locator('.search input').fill('');
    await page.waitForFunction(() => window.__bench.snapshot().total > 99);
    await page.locator('[data-select]').click();
    await page.locator('[data-select] input').fill('999');
    await page.getByText('客户选项 999', { exact: true }).last().click();
    assert.equal((await snapshot(page)).customer, 999);

    process.stdout.write(`${library}/${mode}/${round}: 校验弹窗和表单\n`);
    await clickAction(page, 'open', 'modalOpen');
    await page.waitForTimeout(TRANSITION_WAIT);
    assert.equal(await page.locator('[data-field-input] input, input[data-field-input]').count(), CONFIG.fieldCount);
    await clickAction(page, 'validate', 'validate');
    assert.equal((await snapshot(page)).validation, '校验失败');
    const errorSelector = { exui: '.ex-form-item__error', element: '.el-form-item__error', naive: '.n-form-item-feedback__line', ant: '.ant-form-item-explain-error' }[library];
    await page.locator(errorSelector).nth(CONFIG.fieldCount - 1).waitFor({ state: 'visible' });
    assert.equal(await page.locator(errorSelector).count(), CONFIG.fieldCount);
    await clickAction(page, 'fill', 'formFill');
    await page.locator('.form-grid input').first().fill('人工输入订单资料');
    await page.locator('.form-grid input').first().press('Tab');
    await page.waitForTimeout(TRANSITION_WAIT);
    await clickAction(page, 'validate', 'validate');
    assert.equal((await snapshot(page)).validation, '校验通过');
    if (round === 0) await page.screenshot({ path: resolve(output, `${library}-${mode}-form.png`), fullPage: true });
    await clickAction(page, 'close', 'modalClose');
    await page.waitForTimeout(TRANSITION_WAIT);
    record.heapBeforeCycles = await heap(cdp, page);
    record.heapSeries = [{ cycle: 0, ...record.heapBeforeCycles }];

    for (let cycle = 0; cycle < cycleCount; cycle++) {
      await page.evaluate(() => window.__bench.open());
      await page.waitForTimeout(TRANSITION_WAIT);
      await page.evaluate(() => window.__bench.close());
      await page.waitForTimeout(TRANSITION_WAIT);
      if ((cycle + 1) % 10 === 0) record.heapSeries.push({ cycle: cycle + 1, ...await heap(cdp, page) });
    }
    record.heapAfterCycles = await heap(cdp, page);
    record.endMetrics = metricMap(await cdp.send('Performance.getMetrics'));
    record.final = await snapshot(page);
    record.observed = await page.evaluate(() => JSON.parse(JSON.stringify(window.__observed)));
    await page.evaluate(() => window.__bench.unmount());
    assert.equal(await page.locator('[data-table]').count(), 0);
    await page.waitForTimeout(TRANSITION_WAIT);
    record.heapAfterUnmount = await heap(cdp, page);
    if (values.profile) {
      const { profile } = await cdp.send('Profiler.stop');
      await writeFile(resolve(output, `${library}-${mode}-${round}.cpuprofile`), JSON.stringify(profile));
    }
    assert.deepEqual(errors, []);
    await page.reload({ waitUntil: 'load' });
    await page.waitForFunction(() => window.__ready);
    record.warm = await page.evaluate(() => ({ ...window.__ready, resources: performance.getEntriesByType('resource').map(entry => entry.toJSON()) }));
    results.push(record);
    process.stdout.write(`${JSON.stringify({ library, mode, round, ready: record.initial.at, elements: record.initial.elements,
      heapMiB: record.heapBeforeCycles.usedSize / 1024 ** 2, cyclesDeltaKiB: (record.heapAfterCycles.usedSize - record.heapBeforeCycles.usedSize) / 1024 })}\n`);
  } catch (error) {
    const failure = { library, mode, round, error: String(error), stack: error.stack, pageErrors: errors };
    failures.push(failure);
    await page.screenshot({ path: resolve(output, `${library}-${mode}-${round}-failure.png`), fullPage: true }).catch(() => {});
    console.error(JSON.stringify(failure));
  } finally {
    await context.close();
    await writeFile(resolve(output, 'raw.json'), JSON.stringify({ manifest, results, failures }, null, 2));
  }
}

try {
  // 每轮轮换库顺序，避免温度、缓存和后台活动总是偏向固定的一方。
  for (let round = 0; round < rounds; round++) {
    const ordered = libraries.map((_, index) => libraries[(index + round) % libraries.length]);
    for (const mode of modes) for (const library of ordered) {
      if (library === 'ant' && mode === 'virtual') continue;
      await runCase(library, mode, round);
    }
  }
  const summaries = [];
  for (const mode of modes) for (const library of libraries) {
    const samples = results.filter(item => item.library === library && item.mode === mode);
    if (!samples.length) continue;
    const actions = [...new Set(samples.flatMap(item => item.final.measurements.map(action => action.name)))];
    summaries.push({ library, mode,
      readyMs: summarize(samples.map(item => item.initial.at)), warmMs: summarize(samples.map(item => item.warm.at)),
      elements: summarize(samples.map(item => item.initial.elements)),
      scriptMs: summarize(samples.map(item => item.startMetrics.ScriptDuration * 1000)),
      layoutMs: summarize(samples.map(item => item.startMetrics.LayoutDuration * 1000)),
      heapMiB: summarize(samples.map(item => item.heapBeforeCycles.usedSize / 1024 ** 2)),
      cycleDeltaKiB: summarize(samples.map(item => (item.heapAfterCycles.usedSize - item.heapBeforeCycles.usedSize) / 1024)),
      scrollFrameMs: summarize(samples.flatMap(item => item.scroll.durations)),
      actions: Object.fromEntries(actions.map(name => [name, {
        commitMs: summarize(samples.flatMap(item => item.final.measurements.filter(action => action.name === name).map(action => action.commitMs))),
        paintMs: summarize(samples.flatMap(item => item.final.measurements.filter(action => action.name === name).map(action => action.paintMs))),
      }])),
    });
  }
  await writeFile(resolve(output, 'summary.json'), JSON.stringify({ manifest, summaries, failures }, null, 2));
} finally { await browser.close(); await server.close(); }
if (failures.length) process.exitCode = 1;
