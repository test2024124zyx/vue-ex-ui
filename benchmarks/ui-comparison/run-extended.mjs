import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { serve } from './server.mjs';
import { summarize } from './workload.mjs';

const output = resolve(import.meta.dirname, 'results/extended');
const TRANSITION_MS = 400;
const ROUNDS = 3;
await mkdir(output, { recursive: true });
const server = await serve();
const browser = await chromium.launch({ channel: 'chromium' });
const graphics = await (await browser.newBrowserCDPSession()).send('SystemInfo.getInfo');
const records = [];
const failures = [];
const run = (page, action) => page.evaluate(action => window.__extended.run(action), action);
const state = page => page.evaluate(() => window.__extended.state());

async function memory(cdp) {
  await cdp.send('HeapProfiler.collectGarbage');
  return { ...await cdp.send('Runtime.getHeapUsage'), ...await cdp.send('Memory.getDOMCounters') };
}

async function scroll(page, selector) {
  return page.locator(selector).evaluate(async element => {
    const frames = [];
    let previous = performance.now();
    const steps = 60;
    for (let index = 0; index < steps; index++) {
      element.scrollTop = (element.scrollHeight - element.clientHeight) * index / (steps - 1);
      await new Promise(resolve => requestAnimationFrame(resolve));
      const now = performance.now(); frames.push(now - previous); previous = now;
    }
    await new Promise(resolve => requestAnimationFrame(resolve));
    await new Promise(resolve => requestAnimationFrame(resolve));
    return { frames, end: element.scrollTop, height: element.scrollHeight };
  });
}

const cases = {
  async controls(page) {
    assert.equal(await page.locator('.control-row').count(), 1500);
    const styles = await page.locator('[data-row="1"]').evaluate(row =>
      ['.ex-checkbox__box', '.ex-radio__box', '.ex-radio__dot', '.ex-switch__core', '.ex-switch__action'].map(selector => {
        const element = row.querySelector(selector);
        if (!element) return null;
        const css = getComputedStyle(element);
        return { selector, perspective: css.perspective, transform: css.transform, willChange: css.willChange };
      }).filter(Boolean));
    assert.ok(styles.every(style => style.perspective === 'none' && style.willChange === 'auto'));
    await page.locator('[data-row="1"] .ex-checkbox__box').click();
    assert.equal((await state(page)).checks, 1, '点击可见复选框未更新业务值');
    await page.locator('[data-row="2"] input[type="radio"]').press('Space');
    await page.locator('[data-row="3"]').getByRole('switch').press('Space');
    assert.deepEqual(await state(page), { selected: 2, checks: 1, switches: 1 });
    await run(page, 'toggleAll');
    assert.deepEqual(await state(page), { selected: 2, checks: 1499, switches: 1499 });
    const scrolling = await scroll(page, '[data-scroll]');
    assert.ok(scrolling.end > 0);
    await page.screenshot({ path: resolve(output, 'dense-controls.png') });
    return { idleStyles: styles, scrollFrames: summarize(scrolling.frames) };
  },
  async table(page) {
    assert.ok(await page.locator('.ex-table__row').count() < 40);
    await run(page, 'resetCalls');
    await run(page, 'updateFirst');
    assert.equal((await state(page)).renderCalls, 1);
    assert.ok(await page.locator('.ex-table__row').first().innerText().then(text => text.includes('101元')));
    await run(page, 'resetCalls');
    await run(page, 'updateOffscreen');
    assert.equal((await state(page)).renderCalls, 0);
    await page.locator('.ex-table__row .ex-checkbox').first().click();
    assert.deepEqual((await state(page)).selected, [0]);
    await run(page, 'resizeColumn');
    assert.equal(await page.locator('.ex-table__body-cell').first().evaluate(element => element.style.width), '180px');
    const scrolling = await scroll(page, '.ex-table__container');
    assert.ok(await page.locator('tbody').innerText().then(text => text.includes('订单 49999')));
    await run(page, 'shrink');
    assert.equal(await page.locator('.ex-table__row').count(), 2);
    assert.ok(await page.locator('tbody').innerText().then(text => text.includes('订单 00000')));
    await run(page, 'restore');
    await run(page, 'reverse');
    await page.locator('.ex-table__container').evaluate(element => { element.scrollTop = 0; });
    await page.waitForFunction(() => document.querySelector('.ex-table__row')?.textContent.includes('订单 49999'));
    assert.deepEqual((await state(page)).selected, [0]);
    await run(page, 'changeSuffix');
    assert.ok(await page.locator('.ex-table__row').first().innerText().then(text => text.includes('分')));
    return { scrollFrames: summarize(scrolling.frames), final: await state(page) };
  },
  async select(page) {
    await run(page, 'open');
    await page.locator('.ex-select__input').fill('09999');
    await page.getByRole('option', { name: '候选 09999', exact: true }).click();
    assert.deepEqual((await state(page)).selected, [9999]);
    await run(page, 'close');
    await run(page, 'rename');
    assert.ok(await page.locator('.ex-select').innerText().then(text => text.includes('更新 9999')));
    await run(page, 'selectMany');
    assert.equal((await state(page)).selected.length, 1000);
    assert.equal(await page.locator('.ex-select__tag-close').count(), 1);
    await run(page, 'expandTags');
    assert.equal(await page.locator('.ex-select__tag-close').count(), 1000);
    await run(page, 'clear');
    await run(page, 'remoteFirst');
    await run(page, 'remoteNext');
    assert.deepEqual((await state(page)).selected, [1, 2]);
    const text = await page.locator('.ex-select').innerText();
    assert.ok(text.includes('候选 00001') && text.includes('候选 00002'));
    return { final: await state(page) };
  },
  async tree(page) {
    await run(page, 'expand');
    assert.ok(await page.getByRole('treeitem').count() < 50);
    await run(page, 'checkRoot');
    let current = await state(page);
    assert.equal(current.checked.length, 10101);
    await run(page, 'uncheckLast');
    current = await state(page);
    assert.ok(!current.checked.includes('leaf-9999') && current.halfChecked.includes('root'));
    await run(page, 'filterLast');
    await page.getByText('成员 09999', { exact: true }).waitFor({ state: 'visible' });
    await run(page, 'selectLast');
    assert.deepEqual((await state(page)).selected, ['leaf-9999']);
    await run(page, 'clearFilter');
    await run(page, 'expand');
    const scrolling = await scroll(page, '.ex-tree__viewport');
    assert.ok(await page.locator('.ex-tree').innerText().then(text => text.includes('成员 09999')));
    await run(page, 'collapse');
    assert.equal(await page.getByRole('treeitem').count(), 1);
    await run(page, 'clearCheck');
    assert.equal((await state(page)).checked.length, 0);
    return { scrollFrames: summarize(scrolling.frames), final: await state(page) };
  },
  async workflow(page, cdp) {
    await page.locator('#workflow-trigger').click();
    await page.waitForTimeout(TRANSITION_MS);
    assert.equal(await page.locator('.ex-form input').count(), 100);
    const theme = await page.locator('.ex-modal-root').first().evaluate(root => {
      const probe = document.createElement('div');
      probe.style.backgroundColor = 'var(--ex-color-bg-elevated)';
      root.append(probe);
      const expected = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return { expected, actual: getComputedStyle(root.querySelector('.ex-modal-content')).backgroundColor };
    });
    const issues = theme.actual === theme.expected ? [] : [{
      kind: 'local-theme-background', message: '弹窗背景没有跟随局部亮色主题', ...theme,
    }];
    if (issues.length) await page.screenshot({ path: resolve(output, 'workflow-theme.png') });
    await run(page, 'validate');
    assert.equal((await state(page)).lastResult.errors.length, 100);
    await run(page, 'fill');
    await run(page, 'validate');
    assert.equal((await state(page)).lastResult.valid, true);
    await run(page, 'race');
    assert.deepEqual((await state(page)).raceResult, { oldOutOfDate: true, currentValid: true });
    await page.locator('#inner-trigger').click();
    await page.locator('#inner-input').fill('嵌套弹窗资料');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(TRANSITION_MS);
    let current = await state(page);
    assert.equal(current.inner, false);
    assert.equal(current.opened, true);
    assert.equal(current.bodyOverflow, 'hidden');
    assert.equal(current.focusedId, 'inner-trigger');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(TRANSITION_MS);
    current = await state(page);
    assert.equal(current.opened, false);
    assert.equal(current.bodyOverflow, '');
    assert.equal(current.focusedId, 'workflow-trigger');
    const before = await memory(cdp);
    for (let cycle = 0; cycle < 20; cycle++) {
      await run(page, 'open'); await page.waitForTimeout(TRANSITION_MS);
      await run(page, 'close'); await page.waitForTimeout(TRANSITION_MS);
    }
    const after = await memory(cdp);
    assert.ok(after.nodes <= before.nodes + 10, '关闭后仍残留表单节点');
    assert.ok(after.jsEventListeners <= before.jsEventListeners + 10, '关闭后仍残留监听器');
    return { before, after, issues, final: await state(page) };
  },
};

try {
  for (let round = 0; round < ROUNDS; round++) for (const [scene, verify] of Object.entries(cases)) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, locale: 'zh-CN' });
    page.setDefaultTimeout(30000);
    const errors = [];
    page.on('pageerror', error => errors.push(String(error)));
    const cdp = await page.context().newCDPSession(page);
    try {
      await page.goto(`${server.origin}/extended/extended.html?scene=${scene}`);
      await page.waitForFunction(() => window.__extendedReady);
      const initial = await page.evaluate(() => ({ readyMs: window.__extendedReady, elements: document.querySelectorAll('*').length }));
      const detail = await verify(page, cdp);
      assert.deepEqual(errors, []);
      if (detail.issues?.length) failures.push({ scene, round, issues: detail.issues });
      const measurements = await page.evaluate(() => window.__extended.measurements);
      await page.evaluate(() => window.__extended.unmount());
      await page.waitForTimeout(TRANSITION_MS);
      assert.equal(await page.locator('main > section, .ex-table, .ex-tree, .ex-select, [role="dialog"]').count(), 0);
      records.push({ scene, round, initial, detail, measurements, afterUnmount: await memory(cdp) });
      process.stdout.write(`${scene}/${round}: ${detail.issues?.length ? '发现问题' : '通过'} ${JSON.stringify(initial)}\n`);
    } catch (error) {
      failures.push({ scene, round, error: String(error), stack: error.stack, errors });
      await page.screenshot({ path: resolve(output, `${scene}-${round}-failure.png`) }).catch(() => {});
      process.stderr.write(`${scene}/${round}: ${String(error)}\n`);
    } finally {
      await page.close();
      await writeFile(resolve(output, 'raw.json'), JSON.stringify({ browser: browser.version(), graphics, records, failures }, null, 2));
    }
  }
} finally { await browser.close(); await server.close(); }
if (failures.length) process.exitCode = 1;
