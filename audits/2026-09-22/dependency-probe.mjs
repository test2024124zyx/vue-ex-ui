import { createServer as currentVite } from 'vite';
import { createServer as docsVite } from '../../node_modules/vitepress/node_modules/vite/dist/node/index.js';
import { resolve } from 'node:path';
import { writeFile } from 'node:fs/promises';

// 只访问专门创建的无害标记文件；两个服务器均限于回环地址和该独立目录。
const root = resolve(import.meta.dirname, 'dependency-fixture');
const results = [];
for (const [name, createServer] of [
  ['docs-vite-5.4.21', docsVite],
  ['root-vite-8.2.1', currentVite],
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
process.exitCode = results.some(result => result.exposedSentinel) ? 1 : 0;
