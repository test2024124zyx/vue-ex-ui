import assert from 'node:assert/strict';
import { createServer as currentVite, version as currentVersion } from 'vite';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

// 只访问专门创建的无害标记文件；两个服务器均限于回环地址和该独立目录。
const root = resolve(import.meta.dirname, 'dependency-fixture');
const results = [];
// 按 VitePress 自身的解析位置定位依赖，兼容升级后的去重安装或嵌套安装。
const docsRequire = createRequire(import.meta.resolve('vitepress'));
const docsVite = await import(
  new URL('./dist/node/index.js', pathToFileURL(docsRequire.resolve('vite/package.json'))).href
);
for (const [name, createServer] of [
  [`docs-vite-${docsVite.version}`, docsVite.createServer],
  [`root-vite-${currentVersion}`, currentVite],
]) {
  const server = await createServer({
    root,
    configFile: false,
    envFile: false,
    logLevel: 'silent',
    optimizeDeps: { noDiscovery: true, include: [] },
    server: {
      host: '127.0.0.1',
      port: 0,
      watch: null,
      fs: { strict: true, allow: [root], deny: ['**/audit-denied.txt'] },
    },
  });
  try {
    await server.listen();
    const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
    const control = await fetch(`${origin}/audit-allowed.txt?raw`);
    assert.equal(control.status, 200, '允许访问的控制文件必须正常返回');
    assert.ok((await control.text()).includes('LOCAL_ALLOWED_SENTINEL_20260922'));
    for (const path of ['/audit-denied.txt?raw', '/audit-denied.txt::$DATA?raw']) {
      const response = await fetch(origin + path);
      const text = await response.text();
      results.push({
        name,
        path,
        status: response.status,
        exposedSentinel: text.includes('LOCAL_AUDIT_SENTINEL_20260922'),
      });
    }
  } finally {
    await server.close();
  }
}
await writeFile(
  resolve(import.meta.dirname, '../../.tmp/system-audit-2026-09-22/dependency-probe.json'),
  JSON.stringify(results, null, 2)
);
process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
process.exitCode = results.some(result => result.status !== 403 || result.exposedSentinel) ? 1 : 0;
