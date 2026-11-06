// @vitest-environment node
import { createServer, type Server } from 'node:http';
import { once } from 'node:events';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createDemoMiddleware } from '../../docs/.vitepress/demo-server';
import { DEMO_SERVICE_PREFIX } from '../../docs/.vitepress/demo-contract';

describe('Select 文档的真实远程查询', () => {
  let server: Server;
  let base: string;

  beforeEach(async () => {
    const middleware = createDemoMiddleware({ resolveDelayMs: 5 });
    server = createServer((request, response) => {
      middleware(request, response, () => response.writeHead(404).end());
    });
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('未获得本地服务端口');
    base = `http://127.0.0.1:${address.port}${DEMO_SERVICE_PREFIX}/select-options`;
  });

  afterEach(async () => {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) => {
      server.close(error => (error ? reject(error) : resolve()));
    });
  });

  it('空查询返回可用选项，关键词在服务端过滤且只返回 value/label', async () => {
    const initial = await fetch(base);
    expect(initial.status).toBe(200);
    const options = (await initial.json()) as Array<{ value: string; label: string }>;
    expect(options.length).toBeGreaterThan(1);
    expect(Object.keys(options[0]!).sort()).toEqual(['label', 'value']);
    expect(await (await fetch(`${base}?query=${encodeURIComponent('杭州')}`)).json()).toEqual([
      { value: 'hangzhou', label: '杭州研发中心' },
    ]);
    expect(await (await fetch(`${base}?query=not-found`)).json()).toEqual([]);
    expect((await (await fetch(`${base}?limit=1`)).json()).length).toBe(1);
    expect(initial.headers.get('cache-control')).toBe('no-store');
  });

  it.each([
    'query=a&query=b',
    'limit=1&limit=2',
    'outcome=success&outcome=error',
    'limit=0',
    'limit=-1',
    'limit=1.2',
    'limit=Infinity',
    'limit=51',
    'limit=',
    'outcome=invalid',
    'unexpected=1',
    `query=${'x'.repeat(101)}`,
  ])('拒绝越界或歧义参数：%s', async query => {
    expect((await fetch(`${base}?${query}`)).status).toBe(400);
  });

  it('故障演示返回真实 503，下一次正常查询能够恢复', async () => {
    expect((await fetch(`${base}?outcome=error`)).status).toBe(503);
    expect((await fetch(`${base}?outcome=success`)).status).toBe(200);
  });

  it('复用同源和方法约束', async () => {
    expect((await fetch(base, { method: 'POST' })).status).toBe(405);
    expect((await fetch(base, { headers: { Origin: 'https://untrusted.invalid' } })).status).toBe(
      403
    );
  });

  it('客户端可取消查询，服务仍可继续处理后续查询', async () => {
    const controller = new AbortController();
    const received = once(server, 'request');
    const request = fetch(base, { signal: controller.signal });
    await received;
    controller.abort();
    await expect(request).rejects.toMatchObject({ name: 'AbortError' });
    expect((await fetch(base)).status).toBe(200);
  });
});
