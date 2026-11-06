import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import {
  ExConfigProvider,
  ExPagination,
  ExInput,
  sanitizeHtml,
  deepMerge,
} from '../../dist/ex-ui.js';

const results = [];
assert.equal(typeof document, 'undefined');
for (const locale of ['en-US', 'zh-CN']) {
  const html = await renderToString(
    createSSRApp({
      render: () =>
        h(
          ExConfigProvider,
          { locale },
          {
            default: () => [
              h(ExPagination, { total: 100 }),
              h(ExInput, { modelValue: 'SSR 文本', 'aria-label': '姓名' }),
            ],
          }
        ),
    })
  );
  const expectedText = locale === 'zh-CN' ? '共 100 条数据' : 'Total 100 items';
  results.push({
    kind: 'ssr',
    locale,
    expectedText,
    includesExpected: html.includes(expectedText),
    includesInput: html.includes('SSR 文本'),
    html,
  });
}
// 有限深度探索记录失败边界；没有公开最大深度契约，不把探针上限当作产品承诺。
for (const depth of [32, 128, 512, 1024, 2048, 4096]) {
  const input = '<div>'.repeat(depth) + '审计' + '</div>'.repeat(depth);
  const started = performance.now();
  try {
    const output = sanitizeHtml(input);
    results.push({
      kind: 'depth',
      depth,
      bytes: Buffer.byteLength(input),
      elapsedMs: performance.now() - started,
      status: 'returned',
      containsText: output.includes('审计'),
    });
  } catch (error) {
    results.push({
      kind: 'depth',
      depth,
      bytes: Buffer.byteLength(input),
      elapsedMs: performance.now() - started,
      status: 'threw',
      error: String(error),
    });
  }
}
const merged = deepMerge(JSON.parse('{"__proto__":{"auditInherited":true}}'), { safe: true });
results.push({
  kind: 'merge',
  returnedInherited: merged.auditInherited,
  own: Object.hasOwn(merged, 'auditInherited'),
  globalPolluted: {}.auditInherited === true,
});
await writeFile(
  resolve(import.meta.dirname, '../../.tmp/system-audit-2026-09-22/node-probes.json'),
  JSON.stringify(results, null, 2)
);
process.stdout.write(
  JSON.stringify(
    results.map(({ html: _html, ...result }) => result),
    null,
    2
  ) + '\n'
);
assert.ok(
  results
    .filter(result => result.kind === 'ssr')
    .every(result => result.includesExpected && result.includesInput)
);
