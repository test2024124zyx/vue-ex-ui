// @vitest-environment node
import { createServer, type Server } from 'node:http';
import { once } from 'node:events';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createDemoMiddleware } from '../../docs/.vitepress/demo-server';
import { DEMO_SERVICE_PREFIX, DEMO_MAX_UPLOAD_BYTES } from '../../docs/.vitepress/demo-contract';

describe('文档演示服务的真实 HTTP 请求', () => {
  let server: Server;
  let base: string;

  beforeEach(async () => {
    const middleware = createDemoMiddleware({
      chunkDelayMs: 2,
      resolveDelayMs: 2,
      uploadDelayMs: 2,
    });
    server = createServer((request, response) => {
      middleware(request, response, () => {
        response.writeHead(404).end();
      });
    });
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('未获得本地服务端口');
    base = `http://127.0.0.1:${address.port}${DEMO_SERVICE_PREFIX}`;
  });

  afterEach(async () => {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) =>
      server.close(error => (error ? reject(error) : resolve()))
    );
  });

  it('健康检查与动态地址解析使用实际响应', async () => {
    expect(await (await fetch(`${base}/health`)).json()).toMatchObject({ demo: true });
    const ticket = await (await fetch(`${base}/ticket`)).json();
    expect(ticket).toEqual({
      action: `${DEMO_SERVICE_PREFIX}/upload`,
      headers: { 'X-Exui-Demo': 'documentation' },
    });
  });

  it('读取 multipart 文件并返回实际大小和摘要，不伪造保存地址', async () => {
    const form = new FormData();
    form.append('file', new File(['hello'], 'sample.txt', { type: 'text/plain' }));
    form.append('folder', 'examples');
    const response = await fetch(`${base}/upload`, { method: 'POST', body: form });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      name: 'sample.txt',
      type: 'text/plain',
      size: 5,
      stored: false,
      sha256: '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824',
    });
  });

  it('拒绝跨源、错误方法、非法表单和过大请求', async () => {
    expect(
      (
        await fetch(`${base}/upload`, {
          method: 'POST',
          headers: { Origin: 'https://elsewhere.invalid' },
        })
      ).status
    ).toBe(403);
    expect((await fetch(`${base}/upload`)).status).toBe(405);
    expect((await fetch(`${base}/upload`, { method: 'POST', body: 'invalid' })).status).toBe(400);
    const form = new FormData();
    form.append('description', '没有文件');
    expect((await fetch(`${base}/upload`, { method: 'POST', body: form })).status).toBe(400);
    const oversized = new Uint8Array(DEMO_MAX_UPLOAD_BYTES + 1);
    expect((await fetch(`${base}/upload`, { method: 'POST', body: oversized })).status).toBe(413);
  });

  it('支持确定和不确定总大小的分段下载', async () => {
    const known = await fetch(`${base}/download`);
    const length = Number(known.headers.get('content-length'));
    expect(length).toBeGreaterThan(0);
    const data = await known.arrayBuffer();
    expect(data.byteLength).toBe(length);
    const unknown = await fetch(`${base}/download?length=unknown`);
    expect(unknown.headers.get('content-length')).toBeNull();
    expect(await unknown.text()).toBe(new TextDecoder().decode(data));
  });

  it('下载可在收到首段后取消，取消后服务仍可处理新请求', async () => {
    const controller = new AbortController();
    const response = await fetch(`${base}/download`, { signal: controller.signal });
    const reader = response.body!.getReader();
    expect((await reader.read()).done).toBe(false);
    controller.abort();
    await expect(reader.read()).rejects.toMatchObject({ name: 'AbortError' });
    expect((await fetch(`${base}/health`)).status).toBe(200);
  });

  it('错误示例返回真实 HTTP 错误，未知路径交还文档站', async () => {
    expect((await fetch(`${base}/download?outcome=error`)).status).toBe(503);
    const form = new FormData();
    form.append('file', new File(['hello'], 'sample.txt'));
    expect(
      (await fetch(`${base}/upload?outcome=error`, { method: 'POST', body: form })).status
    ).toBe(422);
    expect((await fetch(`${base}/unknown`)).status).toBe(404);
  });
});
