import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { serve } from './server.mjs';
import { summarize } from './workload.mjs';

const useGpu = process.argv.includes('--gpu');
const output = resolve(import.meta.dirname, useGpu ? 'results/scroll-hardware' : 'results/scroll-diagnostics');
await mkdir(output, { recursive: true });
const server = await serve();
const browser = await chromium.launch({ channel: useGpu ? 'chromium' : undefined });
const records = [];
// 这些覆盖只用于定位浏览器渲染成本，不修改组件库，也不当作已实现的优化。
const variants = {
  baseline: '',
  fixedLayout: '.ex-table__main{table-layout:fixed!important}',
  noEffects: '[data-table] *,[data-table] *::before,[data-table] *::after{box-shadow:none!important;text-shadow:none!important;filter:none!important;backdrop-filter:none!important;animation:none!important;transition:none!important}',
  noClip: '[data-table] *,[data-table] *::before,[data-table] *::after{clip-path:none!important}',
  noButtonDecoration: '[data-table] .ex-button:not(.ex-button--glow)::before,[data-table] .ex-button:not(.ex-button--glow)::after{display:none!important}',
  noCheckboxContain: '[data-table] .ex-checkbox{contain:none!important}',
  noCheckboxGpu: '[data-table] .ex-checkbox__box{transform:none!important;perspective:none!important;backface-visibility:visible!important;will-change:auto!important}',
};

async function stopTrace(cdp) {
  const completed = new Promise(resolve => cdp.once('Tracing.tracingComplete', resolve));
  await cdp.send('Tracing.end');
  const { stream } = await completed;
  let text = '';
  while (true) {
    const chunk = await cdp.send('IO.read', { handle: stream });
    text += chunk.data;
    if (chunk.eof) break;
  }
  await cdp.send('IO.close', { handle: stream });
  return JSON.parse(text);
}

try {
  for (let round = 0; round < 3; round++) {
    const names = Object.keys(variants);
    const ordered = names.map((_, index) => names[(index + round) % names.length]);
    for (const name of ordered) {
      const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
      await page.goto(`${server.origin}/exui/?mode=full`);
      await page.waitForFunction(() => window.__ready);
      if (variants[name]) await page.addStyleTag({ content: variants[name] });
      await page.mouse.move(0, 0);
      await page.waitForTimeout(500);
      const cdp = await page.context().newCDPSession(page);
      let layers = [];
      cdp.on('LayerTree.layerTreeDidChange', event => { layers = event.layers || []; });
      await cdp.send('LayerTree.enable');
      await page.waitForTimeout(100);
      // 未收到图层事件时表示没有观测值，不能解释为页面没有合成图层。
      const layerCount = layers.length || null;
      await cdp.send('LayerTree.disable');
      if (round === 0) await cdp.send('Tracing.start', { categories: 'devtools.timeline,blink.user_timing', transferMode: 'ReturnAsStream' });
      const data = await page.evaluate(async () => {
        const scroller = document.querySelector('.ex-table__container');
        const frames = [];
        let previous = performance.now();
        for (let step = 0; step < 60; step++) {
          scroller.scrollTop = (scroller.scrollHeight - scroller.clientHeight) * step / 59;
          await new Promise(resolve => requestAnimationFrame(resolve));
          const now = performance.now();
          frames.push(now - previous);
          previous = now;
        }
        return { frames, scrollHeight: scroller.scrollHeight, rowHeight: document.querySelector('.ex-table__row').getBoundingClientRect().height };
      });
      let timeline = null;
      if (round === 0) {
        const trace = await stopTrace(cdp);
        await writeFile(resolve(output, `${name}.trace.json`), JSON.stringify(trace));
        const thread = trace.traceEvents.find(event => event.name === 'thread_name' && event.args?.name === 'CrRendererMain');
        const events = trace.traceEvents.filter(event => event.ph === 'X' && event.tid === thread?.tid && event.pid === thread?.pid);
        timeline = Object.fromEntries(['Paint', 'Layout', 'UpdateLayoutTree', 'PrePaint', 'Layerize', 'FunctionCall', 'EvaluateScript'].map(type => [type,
          { count: events.filter(event => event.name === type).length, totalMs: events.filter(event => event.name === type).reduce((sum, event) => sum + event.dur / 1000, 0) }]));
      }
      records.push({ name, round, layerCount, ...data, frameMs: summarize(data.frames), timeline });
      process.stdout.write(`${JSON.stringify(records.at(-1))}\n`);
      await page.close();
    }
  }
  await writeFile(resolve(output, 'summary.json'), JSON.stringify(records, null, 2));
} finally { await browser.close(); await server.close(); }
