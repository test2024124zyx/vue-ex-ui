import { createHash } from 'node:crypto';
import { once } from 'node:events';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { setTimeout as delay } from 'node:timers/promises';
import { TLSSocket } from 'node:tls';
import type { Plugin } from 'vite';
import { DEMO_MAX_FILE_BYTES, DEMO_MAX_UPLOAD_BYTES, DEMO_SERVICE_PREFIX } from './demo-contract';

interface DemoTimings {
  chunkDelayMs: number;
  resolveDelayMs: number;
  uploadDelayMs: number;
}

const DEFAULT_TIMINGS: DemoTimings = {
  chunkDelayMs: 80,
  resolveDelayMs: 1500,
  uploadDelayMs: 1000,
};
const DOWNLOAD_CHUNKS = 48;
const DOWNLOAD_ROWS_PER_CHUNK = 128;
const DOWNLOAD_CHUNK = Buffer.from(
  'id,name,status\n1,ExUI,complete\n'.repeat(DOWNLOAD_ROWS_PER_CHUNK)
);
const SUPPORTED_PATHS = new Set(['health', 'ticket', 'upload', 'download']);

const sendJson = (response: ServerResponse, status: number, value: unknown) => {
  if (response.destroyed || response.writableEnded) return;
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  response.end(JSON.stringify(value));
};

// 请求体始终有界；文件只在内存中读取与计算摘要，不写磁盘，也不返回虚假的保存地址。
const readUpload = async (request: IncomingMessage, signal: AbortSignal) => {
  const chunks: Buffer[] = [];
  let received = 0;
  // 超限时仍需向客户端发送 413，不能让迭代器提前销毁请求所在的连接。
  for await (const chunk of request.iterator({ destroyOnReturn: false })) {
    signal.throwIfAborted();
    const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    received += bytes.length;
    if (received > DEMO_MAX_UPLOAD_BYTES) throw new RangeError('请求超过演示服务的大小限制');
    chunks.push(bytes);
  }
  const body = Buffer.concat(chunks);
  const form = await new Response(body, {
    headers: { 'Content-Type': request.headers['content-type'] ?? '' },
  }).formData();
  const file = form.get('file');
  if (!file || typeof file === 'string') throw new TypeError('请求必须包含 file 文件字段');
  if (file.size > DEMO_MAX_FILE_BYTES) throw new RangeError('文件超过演示服务的大小限制');
  const digest = createHash('sha256')
    .update(Buffer.from(await file.arrayBuffer()))
    .digest('hex');
  return { name: file.name, type: file.type, size: file.size, stored: false, sha256: digest };
};

/** 同一个中间件用于文档开发、构建预览以及真实 HTTP 回归测试。 */
export const createDemoMiddleware = (timings: Partial<DemoTimings> = {}) => {
  const timing = { ...DEFAULT_TIMINGS, ...timings };
  return (request: IncomingMessage, response: ServerResponse, next: () => void): void => {
    let url: URL;
    try {
      url = new URL(request.url ?? '/', 'http://documentation.local');
    } catch {
      sendJson(response, 400, { error: '无效的请求地址' });
      return;
    }
    const path = url.pathname.startsWith(`${DEMO_SERVICE_PREFIX}/`)
      ? url.pathname.slice(DEMO_SERVICE_PREFIX.length + 1)
      : '';
    if (!SUPPORTED_PATHS.has(path)) return next();

    // 演示接口仅供当前文档站使用，拒绝其他站点发起的跨源请求。
    const origin = request.headers.origin;
    if (origin) {
      try {
        const protocol = request.socket instanceof TLSSocket ? 'https:' : 'http:';
        const expectedOrigin = new URL(`${protocol}//${request.headers.host}`).origin;
        if (new URL(origin).origin !== expectedOrigin) {
          sendJson(response, 403, { error: '不接受跨源演示请求' });
          return;
        }
      } catch {
        sendJson(response, 403, { error: '无效的请求来源' });
        return;
      }
    }
    const method = path === 'upload' ? 'POST' : 'GET';
    if (request.method !== method) {
      response.setHeader('Allow', method);
      sendJson(response, 405, { error: `此接口仅接受 ${method}` });
      return;
    }
    if (Number(request.headers['content-length']) > DEMO_MAX_UPLOAD_BYTES) {
      sendJson(response, 413, { error: '请求超过演示服务的大小限制' });
      request.resume();
      return;
    }

    const controller = new AbortController();
    const abort = () => controller.abort();
    response.once('close', abort);
    request.once('aborted', abort);
    const run = async () => {
      if (path === 'health') return sendJson(response, 200, { demo: true });
      if (path === 'ticket') {
        await delay(timing.resolveDelayMs, undefined, { signal: controller.signal });
        return sendJson(response, 200, {
          action: `${DEMO_SERVICE_PREFIX}/upload`,
          headers: { 'X-Exui-Demo': 'documentation' },
        });
      }
      if (path === 'upload') {
        const result = await readUpload(request, controller.signal);
        await delay(timing.uploadDelayMs, undefined, { signal: controller.signal });
        return url.searchParams.get('outcome') === 'error'
          ? sendJson(response, 422, { error: '本次为演示中的服务端拒绝请求' })
          : sendJson(response, 200, result);
      }
      if (url.searchParams.get('outcome') === 'error') {
        return sendJson(response, 503, { error: '本次为演示中的下载服务不可用' });
      }
      response.setHeader('Content-Type', 'text/csv; charset=utf-8');
      response.setHeader('Content-Disposition', 'attachment; filename="streamed-report.csv"');
      response.setHeader('Cache-Control', 'no-store');
      if (url.searchParams.get('length') !== 'unknown') {
        response.setHeader('Content-Length', DOWNLOAD_CHUNK.length * DOWNLOAD_CHUNKS);
      }
      response.flushHeaders();
      for (let index = 0; index < DOWNLOAD_CHUNKS; index++) {
        controller.signal.throwIfAborted();
        if (!response.write(DOWNLOAD_CHUNK))
          await once(response, 'drain', { signal: controller.signal });
        await delay(timing.chunkDelayMs, undefined, { signal: controller.signal });
      }
      response.end();
    };
    void run()
      .catch(error => {
        if (controller.signal.aborted) return;
        if (response.headersSent) response.destroy();
        else {
          if (error instanceof RangeError) {
            // 丢弃剩余请求体但不再保留内容，让 413 完整送达后由 HTTP 管理连接。
            request.resume();
          }
          sendJson(response, error instanceof RangeError ? 413 : 400, {
            error: '演示请求无法处理',
          });
        }
      })
      .finally(() => {
        response.off('close', abort);
        request.off('aborted', abort);
      });
  };
};

export const docsDemoPlugin = (): Plugin => ({
  name: 'exui-documentation-demo-service',
  configureServer(server) {
    server.middlewares.use(createDemoMiddleware());
  },
  configurePreviewServer(server) {
    server.middlewares.use(createDemoMiddleware());
  },
});
