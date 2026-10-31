import { expect, test } from '@playwright/test';
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';

const SAMPLE_FILE = resolve('docs/public/demo-assets/download-sample.csv');
const SAMPLE_BYTES = readFileSync(SAMPLE_FILE);
const PATCH_RESPONSE_DELAY_MS = 300;
const resources = new Map<string, { length: number; data: Buffer }>();
const methods: string[] = [];
const requests: Array<{ method: string; path: string; token?: string }> = [];
const outsideRequests: string[] = [];
const timers = new Set<ReturnType<typeof setTimeout>>();
let sequence = 0;
let endpoint = '';
let redirectTarget = '';
let redirectStatus = 0;
const finish = (response: ServerResponse, status: number) => {
  if (response.destroyed) return;
  response.statusCode = status;
  response.end();
};
const serve = async (request: IncomingMessage, response: ServerResponse) => {
  response.setHeader('Access-Control-Allow-Origin', request.headers.origin ?? '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, HEAD, PATCH, DELETE, OPTIONS');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'Tus-Resumable, Upload-Length, Upload-Offset, Upload-Metadata, Content-Type, X-Api-Key'
  );
  response.setHeader(
    'Access-Control-Expose-Headers',
    'Location, Upload-Offset, Upload-Length, Tus-Resumable'
  );
  response.setHeader('Tus-Resumable', '1.0.0');
  if (request.method === 'OPTIONS') return finish(response, 204);
  const path = request.url ?? '';
  methods.push(request.method ?? '');
  requests.push({
    method: request.method ?? '',
    path,
    token: request.headers['x-api-key'] as string,
  });
  if (redirectStatus && request.method === 'PATCH') {
    request.resume();
    response.setHeader('Location', redirectTarget);
    return finish(response, redirectStatus);
  }
  if (request.method === 'POST') {
    const url = `/files/${++sequence}`;
    resources.set(url, { length: Number(request.headers['upload-length']), data: Buffer.alloc(0) });
    response.setHeader('Location', url);
    return finish(response, 201);
  }
  const resource = resources.get(path);
  if (!resource) return finish(response, 410);
  if (request.method === 'HEAD') {
    response.setHeader('Upload-Offset', resource.data.byteLength);
    response.setHeader('Upload-Length', resource.length);
    return finish(response, 200);
  }
  if (request.method === 'DELETE') {
    resources.delete(path);
    return finish(response, 204);
  }
  if (request.method !== 'PATCH') return finish(response, 405);
  if (Number(request.headers['upload-offset']) !== resource.data.byteLength)
    return finish(response, 409);
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  resource.data = Buffer.concat([resource.data, ...chunks]);
  response.setHeader('Upload-Offset', resource.data.byteLength);
  const timer = setTimeout(() => {
    timers.delete(timer);
    finish(response, 204);
  }, PATCH_RESPONSE_DELAY_MS);
  timers.add(timer);
};
const server = createServer((request, response) => {
  void serve(request, response).catch(() => finish(response, 400));
});
const outside = createServer((request, response) => {
  // 即使攻击者允许任意 CORS，客户端也不能触发这个来源的预检或实际请求。
  outsideRequests.push(request.method ?? '');
  response.setHeader('Access-Control-Allow-Origin', request.headers.origin ?? '*');
  response.setHeader('Access-Control-Allow-Methods', 'PATCH, OPTIONS, GET');
  response.setHeader(
    'Access-Control-Allow-Headers',
    request.headers['access-control-request-headers'] ?? '*'
  );
  request.resume();
  finish(response, 204);
});
const fixtureUrl = (view = 'text', theme = 'light') =>
  `/tests/browser/file-upload-fixture.html?${new URLSearchParams({ endpoint, view, theme })}`;

test.beforeAll(async () => {
  await new Promise<void>(done => outside.listen(0, '127.0.0.1', done));
  const outsideAddress = outside.address();
  if (!outsideAddress || typeof outsideAddress === 'string')
    throw new Error('外部测试服务启动失败');
  redirectTarget = `http://127.0.0.1:${outsideAddress.port}/outside`;
  await new Promise<void>(done => server.listen(0, '127.0.0.1', done));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('tus 测试服务启动失败');
  endpoint = `http://127.0.0.1:${address.port}/files/`;
});
test.beforeEach(() => {
  resources.clear();
  methods.splice(0);
  requests.splice(0);
  outsideRequests.splice(0);
  redirectStatus = 0;
});
test.afterAll(async () => {
  for (const timer of timers) clearTimeout(timer);
  server.closeAllConnections();
  outside.closeAllConnections();
  await new Promise<void>((done, reject) =>
    server.close(error => (error ? reject(error) : done()))
  );
  await new Promise<void>((done, reject) =>
    outside.close(error => (error ? reject(error) : done()))
  );
});

for (const status of [302, 307, 308]) {
  test(`${status} 自动重定向不能向外站泄露上传数据和认证头`, async ({ page }) => {
    redirectStatus = status;
    await page.goto(fixtureUrl());
    await page.locator('input[type=file]').setInputFiles(SAMPLE_FILE);
    await page.locator('[data-upload-action=start]').click();
    await expect(page.locator('#file-state')).toContainText('error');
    await expect(page.locator('[role=alert]')).toBeVisible();
    expect(methods).toEqual(['POST', 'PATCH']);
    expect(outsideRequests).toEqual([]);
  });
}

test('同一组件暂停后切换账号，新凭证只能访问新账号上传资源', async ({ page }) => {
  await page.goto(fixtureUrl());
  await page.locator('input[type=file]').setInputFiles(SAMPLE_FILE);
  await page.locator('[data-upload-action=start]').click();
  await expect.poll(() => [...resources.values()][0]?.data.byteLength ?? 0).toBeGreaterThan(0);
  await page.locator('[data-upload-action=pause]').click();
  await expect(page.locator('#file-state')).toContainText('paused');
  const originalPath = [...resources.keys()][0]!;
  const originalBytes = resources.get(originalPath)!.data.byteLength;
  const before = requests.length;
  await page.locator('#switch-account').click();
  await expect(page.locator('#file-state')).toContainText('ready');
  await page.locator('[data-upload-action=start]').click();
  await expect(page.locator('#file-state')).toContainText('success');
  const following = requests.slice(before);
  expect(following[0]).toMatchObject({ method: 'POST', token: 'dummy-account-b' });
  expect(following.every(request => request.path !== originalPath)).toBe(true);
  expect(resources.get(originalPath)!.data.byteLength).toBe(originalBytes);
  expect([...resources.values()][1]!.data.equals(SAMPLE_BYTES)).toBe(true);
});

for (const view of ['text', 'picture', 'picture-card']) {
  for (const theme of ['light', 'neon-blue']) {
    test(`${view} ${theme} 窄屏暂停、继续和完整分片上传`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(fixtureUrl(view, theme));
      await page.locator('input[type=file]').setInputFiles(SAMPLE_FILE);
      await page.locator('[data-upload-action=start]').click();
      await expect.poll(() => [...resources.values()][0]?.data.byteLength ?? 0).toBeGreaterThan(0);
      await page.locator('[data-upload-action=pause]').click();
      await expect(page.locator('#file-state')).toContainText('paused');
      // 操作必须处于卡片与视口内，不能只是 DOM 存在但被固定高度裁掉。
      const bounds = await page.locator('[data-upload-action=resume]').evaluate(element => {
        const button = element.getBoundingClientRect();
        const item = element.closest('li')!.getBoundingClientRect();
        return {
          bottom: button.bottom,
          itemBottom: item.bottom,
          right: button.right,
          width: innerWidth,
        };
      });
      expect(bounds.bottom).toBeLessThanOrEqual(bounds.itemBottom);
      expect(bounds.right).toBeLessThanOrEqual(bounds.width);
      if (view === 'picture-card') {
        // 深色图片遮罩上的图标必须保持明亮，浅色主题也不能继承低对比度灰色。
        const preview = page.locator('.ex-file-upload__list-item-card-actions button').first();
        await preview.focus();
        await expect(preview).toHaveCSS('color', 'rgb(255, 255, 255)');
      }
      await page.screenshot({ path: test.info().outputPath('paused-upload.png'), fullPage: true });
      await page.locator('[data-upload-action=resume]').click();
      await expect(page.locator('#file-state')).toContainText('success');
      expect([...resources.values()][0]!.data.equals(SAMPLE_BYTES)).toBe(true);
      expect(errors).toEqual([]);
    });
  }
}

test('刷新后重新选择同一原始文件，恢复已保存的服务器偏移', async ({ page }) => {
  await page.goto(fixtureUrl());
  await page.locator('input[type=file]').setInputFiles(SAMPLE_FILE);
  await page.locator('[data-upload-action=start]').click();
  await expect.poll(() => [...resources.values()][0]?.data.byteLength ?? 0).toBeGreaterThan(0);
  await page.locator('[data-upload-action=pause]').click();
  await expect(page.locator('#file-state')).toContainText('paused');
  await page.reload();
  await page.locator('input[type=file]').setInputFiles(SAMPLE_FILE);
  await page.locator('[data-upload-action=start]').click();
  await expect(page.locator('#file-state')).toContainText('success');
  expect(methods.filter(method => method === 'POST')).toHaveLength(1);
  expect(methods).toContain('HEAD');
  expect([...resources.values()][0]!.data.equals(SAMPLE_BYTES)).toBe(true);
});

test('永久取消等待真实 DELETE，排队文件遵守单文件并发', async ({ page }) => {
  await page.goto(fixtureUrl());
  await page.locator('input[type=file]').setInputFiles([
    { name: 'a.txt', mimeType: 'text/plain', buffer: Buffer.alloc(90, 'a') },
    { name: 'b.txt', mimeType: 'text/plain', buffer: Buffer.alloc(90, 'b') },
  ]);
  await page.locator('#submit-all').click();
  await expect(page.locator('#file-state')).toContainText('queued');
  await expect.poll(() => resources.size).toBe(1);
  await expect(page.locator('#file-state')).toContainText('/files/');
  await page.locator('li[aria-label^="b.txt,"] [data-upload-action=cancel]').click();
  await page.locator('li[aria-label^="a.txt,"] [data-upload-action=cancel]').click();
  await expect.poll(() => resources.size).toBe(0);
  await expect(page.locator('#file-state')).not.toContainText('cancelling');
  expect(methods).toContain('DELETE');
  expect(methods.filter(method => method === 'POST')).toHaveLength(1);
});
