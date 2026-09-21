import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { gzipSync } from 'node:zlib';

// 仅提供本机生产产物，并按真实 gzip 响应记录浏览器传输体积。
export async function serve() {
  const root = resolve(import.meta.dirname, 'dist');
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      const file = resolve(root, `.${pathname.endsWith('/') ? `${pathname}index.html` : pathname}`);
      if (!file.startsWith(root + sep)) { response.writeHead(403).end(); return; }
      const content = await readFile(file);
      const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.map': 'application/json' };
      const compressed = gzipSync(content);
      response.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream',
        'Content-Encoding': 'gzip', 'Content-Length': compressed.length, 'Cache-Control': 'public, max-age=3600' });
      response.end(compressed);
    } catch { response.writeHead(404).end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  return { origin: `http://127.0.0.1:${server.address().port}`, close: () => new Promise(resolve => server.close(resolve)) };
}
