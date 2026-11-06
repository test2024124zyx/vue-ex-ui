// @vitest-environment node
import { once } from 'node:events';
import {
  createServer,
  IncomingMessage,
  request as sendRequest,
  ServerResponse,
  type Server,
} from 'node:http';
import { Socket } from 'node:net';
import { setImmediate as nextImmediate } from 'node:timers/promises';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createDemoMiddleware } from '../../docs/.vitepress/demo-server';
import {
  DEMO_MAX_FILE_BYTES,
  DEMO_MAX_UPLOAD_BYTES,
  DEMO_SERVICE_PREFIX,
} from '../../docs/.vitepress/demo-contract';

describe('演示服务的 HTTP 边界与中止清理', () => {
  let server: Server;
  let base: string;

  beforeEach(async () => {
    const middleware = createDemoMiddleware({ chunkDelayMs: 1, uploadDelayMs: 1 });
    server = createServer((request, response) => {
      middleware(request, response, () => response.writeHead(404).end());
    });
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('未获得本地服务端口');
    base = `http://127.0.0.1:${address.port}${DEMO_SERVICE_PREFIX}`;
  });

  afterEach(async () => {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) => {
      server.close(error => (error ? reject(error) : resolve()));
    });
  });

  it('没有 Content-Length 的超限上传返回 413，而非重置连接', async () => {
    const status = await new Promise<number | undefined>((resolve, reject) => {
      const request = sendRequest(
        `${base}/upload`,
        { method: 'POST', headers: { 'Transfer-Encoding': 'chunked' } },
        response => {
          response.resume();
          response.once('end', () => resolve(response.statusCode));
          response.once('error', reject);
        }
      );
      request.once('error', reject);
      request.end(Buffer.alloc(DEMO_MAX_UPLOAD_BYTES + 1));
    });
    expect(status).toBe(413);
  });

  it('无效的请求地址返回 400，不能让解析异常逃逸到 HTTP 服务', () => {
    const socket = new Socket();
    const incoming = new IncomingMessage(socket);
    incoming.url = 'http://[';
    const response = new ServerResponse(incoming);
    try {
      expect(() => createDemoMiddleware()(incoming, response, () => undefined)).not.toThrow();
      expect(response.statusCode).toBe(400);
    } finally {
      response.destroy();
      socket.destroy();
    }
  });

  it('同一 host 但不同协议的 Origin 仍属于跨源请求', async () => {
    const origin = new URL(base).origin.replace('http:', 'https:');
    const response = await fetch(`${base}/health`, { headers: { Origin: origin } });
    expect(response.status).toBe(403);
    await response.arrayBuffer();
  });

  it.each([
    [DEMO_MAX_FILE_BYTES, 200],
    [DEMO_MAX_FILE_BYTES + 1, 413],
  ])('multipart 文件大小为 %i 字节时返回 %i', async (size, status) => {
    const form = new FormData();
    form.append('file', new File([new Uint8Array(size!)], 'boundary.bin'));
    const response = await fetch(`${base}/upload`, { method: 'POST', body: form });
    expect(response.status).toBe(status);
    if (status === 200) expect(await response.json()).toMatchObject({ size, stored: false });
    else await response.arrayBuffer();
  });

  it('上传尚未结束时中止会移除请求与响应监听，服务仍可继续工作', async () => {
    const arrived = once(server, 'request');
    const request = sendRequest(`${base}/upload`, {
      method: 'POST',
      headers: {
        'Transfer-Encoding': 'chunked',
        'Content-Type': 'multipart/form-data; boundary=demo',
      },
    });
    // 客户端主动中止会产生 socket hang up，监听后由服务端生命周期断言结果。
    request.on('error', () => undefined);
    request.write('--demo\r\n');
    const [incoming, response] = await arrived;
    const closed = once(response, 'close');
    request.destroy();
    await closed;
    await nextImmediate();
    expect(incoming.listenerCount('aborted')).toBe(0);
    expect(response.listenerCount('close')).toBe(0);
    expect((await fetch(`${base}/health`)).status).toBe(200);
  });

  it('动态解析期间中止会结束延时并移除关闭监听', async () => {
    const arrived = once(server, 'request');
    const request = sendRequest(`${base}/ticket`);
    request.on('error', () => undefined);
    request.end();
    const [incoming, response] = await arrived;
    const closed = once(response, 'close');
    request.destroy();
    await closed;
    await nextImmediate();
    expect(incoming.listenerCount('aborted')).toBe(0);
    expect(response.listenerCount('close')).toBe(0);
  });
});
