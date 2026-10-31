import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { createServer } from 'node:http';
import { TusHttpStack } from '../../../src/components/file-upload/tus-http-stack';

const received: Array<{ body: string; token?: string }> = [];
const outside = createServer(async (request, response) => {
  response.setHeader('Access-Control-Allow-Origin', request.headers.origin ?? '*');
  response.setHeader('Access-Control-Allow-Headers', 'X-Api-Key, Content-Type');
  response.setHeader('Access-Control-Allow-Methods', 'PATCH, OPTIONS');
  if (request.method === 'OPTIONS') {
    response.end();
    return;
  }
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  received.push({
    body: Buffer.concat(chunks).toString(),
    token: request.headers['x-api-key'] as string,
  });
  response.statusCode = 204;
  response.end();
});
let target = '';
let endpoint = '';
const origin = createServer((request, response) => {
  response.setHeader('Access-Control-Allow-Origin', request.headers.origin ?? '*');
  response.setHeader('Access-Control-Allow-Headers', 'X-Api-Key, Content-Type');
  response.setHeader('Access-Control-Allow-Methods', 'PATCH, OPTIONS');
  if (request.method === 'OPTIONS') {
    response.end();
    return;
  }
  response.statusCode = Number(request.url?.slice(1)) || 307;
  response.setHeader('Location', target);
  response.end();
});

describe('tus 请求的网络边界', () => {
  beforeAll(async () => {
    for (const server of [outside, origin]) {
      await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
    }
    const outer = outside.address();
    const inner = origin.address();
    if (!outer || typeof outer === 'string' || !inner || typeof inner === 'string') {
      throw new Error('本地重定向测试服务未启动');
    }
    target = `http://127.0.0.1:${outer.port}/stolen`;
    endpoint = `http://127.0.0.1:${inner.port}`;
  });
  afterAll(async () => {
    for (const server of [outside, origin]) {
      server.closeAllConnections();
      await new Promise<void>((resolve, reject) =>
        server.close(error => (error ? reject(error) : resolve()))
      );
    }
  });

  it.each([301, 302, 303, 307, 308])('%i 重定向不得向未批准来源发送正文或凭证', async status => {
    received.splice(0);
    const request = new TusHttpStack().createRequest('PATCH', `${endpoint}/${status}`);
    request.setHeader('X-Api-Key', 'dummy-review-token');
    await expect(request.send('audit-upload')).rejects.toBeInstanceOf(Error);
    expect(received).toEqual([]);
  });

  it('发送前中止不发网络请求，重复中止安全完成', async () => {
    const request = new TusHttpStack().createRequest('PATCH', `${endpoint}/307`);
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    await request.abort();
    await request.abort();
    await expect(request.send('cancelled')).rejects.toMatchObject({ name: 'AbortError' });
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});
