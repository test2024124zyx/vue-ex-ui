import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createServer } from 'node:http';
import { File as NetworkFile } from 'node:buffer';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { mount } from '@vue/test-utils';
import ExFileUpload from '../../../src/components/file-upload/ExFileUpload.vue';
import {
  createTusUploadRequest,
  terminateTusUploadResource,
} from '../../../src/components/file-upload/tus-upload';
import type { ExFileUploadExposed, UploadFile } from '../../../src/components/file-upload/types';

// 加载正式浏览器入口；Node 原生 File 与 fetch 配对，真实浏览器另有端到端覆盖。
vi.mock('tus-js-client', async () => {
  const browserEntry = 'tus-js-client/lib.es5/browser/index.js';
  return import(browserEntry);
});

interface Resource {
  length: number;
  content: Buffer;
  metadata?: string;
}
const resources = new Map<string, Resource>();
const requests: Array<{ method: string; path: string; offset?: number; authorization?: string }> =
  [];
let endpoint = '';
let sequence = 0;
let rejectPatchOnce = false;
let denyAuthentication = false;
let responseDelay = 0;
const pendingTimers = new Set<ReturnType<typeof setTimeout>>();

const respond = (response: ServerResponse, status: number) => {
  if (response.destroyed) return;
  response.statusCode = status;
  response.end();
};
const serve = async (request: IncomingMessage, response: ServerResponse) => {
  response.setHeader('Access-Control-Allow-Origin', request.headers.origin ?? '*');
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader('Access-Control-Allow-Methods', 'POST, HEAD, PATCH, DELETE, OPTIONS');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'Tus-Resumable, Upload-Length, Upload-Offset, Upload-Metadata, Content-Type, Authorization'
  );
  response.setHeader(
    'Access-Control-Expose-Headers',
    'Tus-Resumable, Upload-Offset, Upload-Length, Location, Tus-Version, Tus-Extension'
  );
  response.setHeader('Tus-Resumable', '1.0.0');
  if (request.method === 'OPTIONS') {
    response.setHeader('Tus-Version', '1.0.0');
    response.setHeader('Tus-Extension', 'creation,termination');
    respond(response, 204);
    return;
  }
  const path = request.url ?? '/';
  const method = request.method ?? '';
  requests.push({
    method,
    path,
    authorization: request.headers.authorization,
    offset:
      request.headers['upload-offset'] === undefined
        ? undefined
        : Number(request.headers['upload-offset']),
  });
  if (denyAuthentication) return respond(response, 403);
  if (request.headers['tus-resumable'] !== '1.0.0') return respond(response, 412);
  if (method === 'POST' && path === '/files/') {
    const length = Number(request.headers['upload-length']);
    if (!Number.isSafeInteger(length) || length < 0) return respond(response, 400);
    const url = `/files/${++sequence}`;
    resources.set(url, {
      length,
      content: Buffer.alloc(0),
      metadata: request.headers['upload-metadata'] as string | undefined,
    });
    response.setHeader('Location', url);
    return respond(response, 201);
  }
  const resource = resources.get(path);
  if (!resource) return respond(response, 410);
  if (method === 'HEAD') {
    response.setHeader('Upload-Length', resource.length);
    response.setHeader('Upload-Offset', resource.content.byteLength);
    response.setHeader('Cache-Control', 'no-store');
    return respond(response, 200);
  }
  if (method === 'DELETE') {
    resources.delete(path);
    if (responseDelay) {
      const timer = setTimeout(() => {
        pendingTimers.delete(timer);
        respond(response, 204);
      }, responseDelay);
      pendingTimers.add(timer);
      return;
    }
    return respond(response, 204);
  }
  if (method !== 'PATCH') return respond(response, 405);
  if (rejectPatchOnce) {
    rejectPatchOnce = false;
    request.resume();
    return respond(response, 503);
  }
  if (request.headers['content-type'] !== 'application/offset+octet-stream')
    return respond(response, 415);
  if (Number(request.headers['upload-offset']) !== resource.content.byteLength)
    return respond(response, 409);
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  const incoming = Buffer.concat(chunks);
  if (resource.content.byteLength + incoming.byteLength > resource.length)
    return respond(response, 413);
  resource.content = Buffer.concat([resource.content, incoming]);
  response.setHeader('Upload-Offset', resource.content.byteLength);
  if (!responseDelay) return respond(response, 204);
  const timer = setTimeout(() => {
    pendingTimers.delete(timer);
    respond(response, 204);
  }, responseDelay);
  pendingTimers.add(timer);
};
const server = createServer((request, response) => {
  void serve(request, response).catch(() => respond(response, 400));
});
const sourceFile = (): UploadFile => {
  const raw = new NetworkFile(['abcdefghij'], 'network.txt', {
    type: 'text/plain',
    lastModified: 100,
  }) as unknown as File;
  return { uid: 'network', name: raw.name, size: raw.size, type: raw.type, raw, status: 'ready' };
};
const pauseAfterFirstChunk = async () => {
  responseDelay = 100;
  const source = sourceFile();
  const upload = createTusUploadRequest({
    file: source,
    action: endpoint,
    tus: { chunkSize: 4, retryDelays: [] },
  });
  await vi.waitFor(() => expect([...resources.values()][0]?.content.byteLength).toBe(4));
  expect(upload.abort()).toBe(true);
  await expect(upload.promise).resolves.toEqual({ outcome: 'aborted' });
  responseDelay = 0;
  return { source, upload };
};

describe('tus 浏览器客户端与真实 HTTP 服务', () => {
  beforeAll(async () => {
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('本地测试服务未启动');
    endpoint = `http://127.0.0.1:${address.port}/files/`;
  });
  beforeEach(() => {
    resources.clear();
    requests.splice(0);
    localStorage.clear();
    rejectPatchOnce = false;
    denyAuthentication = false;
    responseDelay = 0;
    for (const timer of pendingTimers) clearTimeout(timer);
    pendingTimers.clear();
  });
  afterAll(async () => {
    for (const timer of pendingTimers) clearTimeout(timer);
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) =>
      server.close(error => (error ? reject(error) : resolve()))
    );
  });

  it('POST 创建后按 0、4、8 偏移 PATCH，服务端收到完整原始字节', async () => {
    const handle = createTusUploadRequest({
      file: sourceFile(),
      action: endpoint,
      tus: { chunkSize: 4, retryDelays: [] },
    });
    await expect(handle.promise).resolves.toMatchObject({ outcome: 'success' });
    expect(
      requests.filter(request => request.method === 'PATCH').map(request => request.offset)
    ).toEqual([0, 4, 8]);
    expect([...resources.values()][0]!.content.toString()).toBe('abcdefghij');
    expect([...resources.values()][0]!.metadata).toContain('filename');
    expect(localStorage.length).toBe(0);
  });

  it('新客户端使用持久记录 HEAD 查询断点，从服务器已接受的偏移继续', async () => {
    const { source } = await pauseAfterFirstChunk();
    const before = requests.length;
    const resumed = createTusUploadRequest({
      file: source,
      action: endpoint,
      tus: { chunkSize: 4, retryDelays: [] },
    });
    await expect(resumed.promise).resolves.toMatchObject({ outcome: 'success' });
    const resumedRequests = requests.slice(before);
    expect(resumedRequests[0]!.method).toBe('HEAD');
    expect(
      resumedRequests.filter(request => request.method === 'PATCH').map(request => request.offset)
    ).toEqual([4, 8]);
    expect(resources.size).toBe(1);
    expect([...resources.values()][0]!.content.toString()).toBe('abcdefghij');
  });

  it.each([true, false])(
    '同一组件切换认证后不以新凭证访问旧资源：更新作用域 %s',
    async changeKey => {
      responseDelay = 100;
      const wrapper = mount(ExFileUpload, {
        props: {
          transport: 'tus',
          action: endpoint,
          autoUpload: false,
          defaultFileList: [sourceFile()],
          headers: { Authorization: 'Bearer account-a' },
          tus: { chunkSize: 4, retryDelays: [], resumeKey: 'account-a' },
        },
      });
      const vm = wrapper.vm as unknown as ExFileUploadExposed;
      try {
        const first = vm.submit();
        await vi.waitFor(() => expect([...resources.values()][0]?.content.byteLength).toBe(4));
        vm.pause();
        await first;
        const originalPath = [...resources.keys()][0]!;
        const before = requests.length;
        responseDelay = 0;
        await wrapper.setProps({
          headers: { Authorization: 'Bearer account-b' },
          tus: { chunkSize: 4, retryDelays: [], resumeKey: changeKey ? 'account-b' : 'account-a' },
        });
        await expect(vm.submit()).resolves.toMatchObject([{ outcome: 'success' }]);
        const following = requests.slice(before);
        expect(following[0]).toMatchObject({ method: 'POST', authorization: 'Bearer account-b' });
        expect(following.every(request => request.path !== originalPath)).toBe(true);
        expect(resources.get(originalPath)!.content.toString()).toBe('abcd');
        expect([...resources.values()][1]!.content.toString()).toBe('abcdefghij');
      } finally {
        wrapper.unmount();
      }
    }
  );

  it('可恢复的 503 自动重试，403 不重试也不创建成功记录', async () => {
    rejectPatchOnce = true;
    const retrying = createTusUploadRequest({
      file: sourceFile(),
      action: endpoint,
      tus: { chunkSize: 4, retryDelays: [0] },
    });
    await expect(retrying.promise).resolves.toMatchObject({ outcome: 'success' });
    expect(requests.some(request => request.method === 'HEAD')).toBe(true);
    expect([...resources.values()][0]!.content.toString()).toBe('abcdefghij');
    denyAuthentication = true;
    requests.splice(0);
    const denied = createTusUploadRequest({
      file: sourceFile(),
      action: endpoint,
      tus: { retryDelays: [0, 0] },
    });
    await expect(denied.promise).resolves.toMatchObject({
      outcome: 'error',
      error: { status: 403 },
    });
    expect(requests).toHaveLength(1);
  });

  it('跨挂载取消只发 DELETE，不重传文件，并清理本地断点', async () => {
    const { source, upload } = await pauseAfterFirstChunk();
    const url = upload.uploadUrl;
    expect(url).toBeTruthy();
    const before = requests.length;
    await expect(
      terminateTusUploadResource({ file: source, action: endpoint, uploadUrl: url })
    ).resolves.toBe(true);
    expect(requests.slice(before).map(request => request.method)).toEqual(['DELETE']);
    expect(resources.size).toBe(0);
    expect(localStorage.length).toBe(0);
  });

  it('服务器上的历史资源过期后重新创建，不沿用错误偏移', async () => {
    const { source } = await pauseAfterFirstChunk();
    resources.clear();
    const resumed = createTusUploadRequest({
      file: source,
      action: endpoint,
      tus: { chunkSize: 4, retryDelays: [] },
    });
    await expect(resumed.promise).resolves.toMatchObject({ outcome: 'success' });
    expect([...resources.values()][0]!.content.toString()).toBe('abcdefghij');
  });

  it('真实请求超时必须兑现失败，不能悬挂上传 Promise', async () => {
    responseDelay = 250;
    const handle = createTusUploadRequest({
      file: sourceFile(),
      action: endpoint,
      timeout: 30,
      tus: { chunkSize: 4, retryDelays: [] },
    });
    const outcome = await Promise.race([
      handle.promise,
      new Promise(resolve => setTimeout(() => resolve('仍在等待'), 150)),
    ]);
    handle.abort();
    expect(outcome).toMatchObject({ outcome: 'error', error: { code: 'timeout' } });
  });

  it('离开页面时可中止尚未确认的 DELETE，不悬挂永久取消操作', async () => {
    const { source, upload } = await pauseAfterFirstChunk();
    responseDelay = 250;
    const controller = new AbortController();
    const pending = terminateTusUploadResource(
      { file: source, action: endpoint, uploadUrl: upload.uploadUrl },
      controller.signal
    );
    const checked = expect(pending).rejects.toMatchObject({ code: 'termination-error' });
    await vi.waitFor(() =>
      expect(requests.some(request => request.method === 'DELETE')).toBe(true)
    );
    controller.abort();
    await checked;
  });
});
