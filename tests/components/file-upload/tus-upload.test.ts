import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { HttpRequest, Upload } from 'tus-js-client';
import { createTusUploadRequest } from '../../../src/components/file-upload/tus-upload';
import type { UploadFile } from '../../../src/components/file-upload/types';

type TusOptions = ConstructorParameters<typeof Upload>[1];
const state = vi.hoisted(() => ({
  instances: [] as Array<{
    options: TusOptions;
    url: string | null;
    start: ReturnType<typeof vi.fn>;
    abort: ReturnType<typeof vi.fn>;
    resumeFromPreviousUpload: ReturnType<typeof vi.fn>;
  }>,
  previous: [] as Awaited<ReturnType<Upload['findPreviousUploads']>>,
  storageError: false,
  supported: true,
}));

vi.mock('tus-js-client', () => ({
  get isSupported() {
    return state.supported;
  },
  Upload: class {
    url: string | null = null;
    start = vi.fn();
    abort = vi.fn(async () => {});
    resumeFromPreviousUpload = vi.fn();
    constructor(
      _file: File,
      readonly options: TusOptions
    ) {
      state.instances.push(this);
    }
    async findPreviousUploads() {
      if (state.storageError) throw new Error('存储不可读');
      return state.previous;
    }
  },
}));

const file = (): UploadFile => {
  const raw = new File(['abcdefghij'], '文件.txt', { type: 'text/plain', lastModified: 100 });
  return { uid: 'file', raw, name: raw.name, size: raw.size, type: raw.type, status: 'ready' };
};
const response = (status = 204) => ({
  getStatus: () => status,
  getHeader: () => undefined,
  getBody: () => '',
  getUnderlyingObject: () => null,
});
const started = async () => {
  await vi.waitFor(() => expect(state.instances.at(-1)?.start).toHaveBeenCalled());
  return state.instances.at(-1)!;
};

describe('tus 标准上传适配', () => {
  beforeEach(() => {
    state.instances = [];
    state.previous = [];
    state.storageError = false;
    state.supported = true;
  });
  afterEach(() => vi.restoreAllMocks());

  it('使用顺序分片、可配置重试和字符串元数据，完成时返回真实上传资源地址', async () => {
    const onProgress = vi.fn();
    const onUploadUrl = vi.fn();
    const handle = createTusUploadRequest({
      file: file(),
      action: '/files/',
      tus: { chunkSize: 5, retryDelays: [0, 10], metadata: { project: 'demo' } },
      onProgress,
      onUploadUrl,
    });
    const upload = await started();
    expect(upload.options).toMatchObject({
      chunkSize: 5,
      parallelUploads: 1,
      retryDelays: [0, 10],
      metadata: { filename: '文件.txt', filetype: 'text/plain', project: 'demo' },
      removeFingerprintOnSuccess: true,
    });
    upload.url = new URL('/files/id', document.baseURI).href;
    upload.options.onUploadUrlAvailable?.();
    upload.options.onProgress?.(5, 10);
    upload.options.onSuccess?.({ lastResponse: response() });
    await expect(handle.promise).resolves.toEqual({
      outcome: 'success',
      response: { uploadUrl: upload.url },
    });
    expect(onProgress).toHaveBeenCalledWith(50);
    expect(onUploadUrl).toHaveBeenCalledWith(upload.url);
    expect(handle.abort()).toBe(false);
  });

  it('仅恢复大小和来源匹配的最新上传，不使用其他主机或并行分片记录', async () => {
    const entry = (url: string, time: string) => ({
      uploadUrl: url,
      creationTime: time,
      size: 10,
      metadata: {},
      urlStorageKey: time,
      parallelUploadUrls: null,
    });
    const oldest = entry(new URL('/files/old', document.baseURI).href, '2024-01-01');
    const newest = entry(new URL('/files/new', document.baseURI).href, '2025-01-01');
    state.previous = [oldest, newest, entry('https://untrusted.invalid/upload', '2026-01-01')];
    const handle = createTusUploadRequest({ file: file(), action: '/files/' });
    const upload = await started();
    expect(upload.resumeFromPreviousUpload).toHaveBeenCalledWith(newest);
    handle.abort();
    await expect(handle.promise).resolves.toEqual({ outcome: 'aborted' });
    expect(upload.abort).toHaveBeenCalledWith(false);
  });

  it('禁用续传时不恢复历史记录；指纹包含端点、账户作用域和文件身份', async () => {
    const source = file();
    const handle = createTusUploadRequest({
      file: source,
      action: '/files/',
      tus: { resume: false, resumeKey: 'account-a' },
    });
    const upload = await started();
    expect(upload.resumeFromPreviousUpload).not.toHaveBeenCalled();
    expect(upload.options.storeFingerprintForResuming).toBe(false);
    const fingerprint = await upload.options.fingerprint!(source.raw!, upload.options);
    expect(fingerprint).toContain('account-a');
    expect(fingerprint).toContain('/files/');
    expect(fingerprint).toContain('文件.txt');
    handle.abort();
  });

  it('存储不可访问时仍可开始新的上传，并报告续传存储不可用', async () => {
    state.storageError = true;
    const onResumeUnavailable = vi.fn();
    const handle = createTusUploadRequest({ file: file(), action: '/files/', onResumeUnavailable });
    await started();
    expect(onResumeUnavailable).toHaveBeenCalledOnce();
    handle.abort();
  });

  it('凭证边界已失效时跳过旧持久断点，但继续保存新账号资源', async () => {
    state.previous = [
      {
        uploadUrl: new URL('/files/old-account', document.baseURI).href,
        creationTime: '2025-01-01',
        size: 10,
        metadata: {},
        urlStorageKey: 'old-account',
        parallelUploadUrls: null,
      },
    ];
    const handle = createTusUploadRequest({
      file: file(),
      action: '/files/',
      skipPreviousUploads: true,
    });
    const upload = await started();
    expect(upload.resumeFromPreviousUpload).not.toHaveBeenCalled();
    expect(upload.options.storeFingerprintForResuming).toBe(true);
    handle.abort();
  });

  it('请求前刷新认证配置、设置凭证与超时，并拒绝跨来源请求', async () => {
    const headers = vi.fn(async () => ({ Authorization: 'Bearer current' }));
    const handle = createTusUploadRequest({
      file: file(),
      action: '/files/',
      headers,
      withCredentials: true,
      timeout: 1200,
    });
    const upload = await started();
    const native: { timeout?: number; withCredentials?: boolean } = {};
    const request = {
      getURL: () => new URL('/files/id', document.baseURI).href,
      setHeader: vi.fn(),
      getUnderlyingObject: () => native,
      abort: vi.fn(async () => {}),
    } as unknown as HttpRequest;
    await upload.options.onBeforeRequest?.(request);
    expect(request.setHeader).toHaveBeenCalledWith('Authorization', 'Bearer current');
    expect(native).toEqual({ timeout: 1200, withCredentials: true });
    await expect(
      upload.options.onBeforeRequest?.({
        ...request,
        getURL: () => 'https://untrusted.invalid/upload',
      } as HttpRequest)
    ).rejects.toThrow('来源');
    expect(headers).toHaveBeenCalledTimes(1);
    handle.abort();
  });

  it.each([
    { chunkSize: 0 },
    { chunkSize: 1.5 },
    { chunkSize: Number.NaN },
    { retryDelays: [-1] },
    { retryDelays: [Number.POSITIVE_INFINITY] },
  ])('非法协议配置在创建上传前失败：%j', async tus => {
    const handle = createTusUploadRequest({ file: file(), action: '/files/', tus });
    await expect(handle.promise).resolves.toMatchObject({
      outcome: 'error',
      error: { code: 'configuration-error' },
    });
    expect(state.instances).toHaveLength(0);
  });

  it('在异步端点解析期间取消，晚到的结果不得启动请求', async () => {
    let resolve!: (url: string) => void;
    const handle = createTusUploadRequest({
      file: file(),
      action: () => new Promise<string>(done => (resolve = done)),
    });
    expect(handle.pending).toBe(true);
    expect(handle.abort()).toBe(true);
    resolve('/files/');
    await expect(handle.promise).resolves.toEqual({ outcome: 'aborted' });
    await Promise.resolve();
    expect(state.instances).toHaveLength(0);
  });

  it('取消后忽略迟到的进度、成功和失败，终止单独等待服务端确认', async () => {
    const onProgress = vi.fn();
    const handle = createTusUploadRequest({ file: file(), action: '/files/', onProgress });
    const upload = await started();
    upload.url = new URL('/files/id', document.baseURI).href;
    handle.abort();
    upload.options.onProgress?.(10, 10);
    upload.options.onSuccess?.({ lastResponse: response() });
    upload.options.onError?.(new Error('迟到失败'));
    await expect(handle.promise).resolves.toEqual({ outcome: 'aborted' });
    expect(onProgress).not.toHaveBeenCalled();
    await expect(handle.terminate()).resolves.toBe(true);
    expect(upload.abort).toHaveBeenLastCalledWith(true);
  });

  it('服务端拒绝 termination 时返回结构化错误，不能宣称资源已删除', async () => {
    const handle = createTusUploadRequest({ file: file(), action: '/files/' });
    const upload = await started();
    upload.url = new URL('/files/id', document.baseURI).href;
    upload.abort.mockRejectedValue(new Error('不支持删除'));
    await expect(handle.terminate()).rejects.toMatchObject({ code: 'termination-error' });
    await expect(handle.promise).resolves.toEqual({ outcome: 'aborted' });
  });

  it('传输错误保留 HTTP 状态与根因', async () => {
    const handle = createTusUploadRequest({ file: file(), action: '/files/' });
    const upload = await started();
    const error = Object.assign(new Error('拒绝访问'), { originalResponse: response(403) });
    upload.options.onError?.(error);
    await expect(handle.promise).resolves.toMatchObject({
      outcome: 'error',
      error: { status: 403, cause: error },
    });
  });

  it('运行环境不支持 tus 时返回明确失败，取消无资源的任务不伪造删除', async () => {
    state.supported = false;
    const unsupported = createTusUploadRequest({ file: file(), action: '/files/' });
    await expect(unsupported.promise).resolves.toMatchObject({
      outcome: 'error',
      error: { code: 'unsupported' },
    });
    await expect(unsupported.terminate()).resolves.toBe(false);
  });

  it('异步元数据未完成时中止，任何晚到结果都不能创建 tus 客户端', async () => {
    let finish!: (metadata: Record<string, string>) => void;
    const handle = createTusUploadRequest({
      file: file(),
      action: '/files/',
      tus: { metadata: () => new Promise(resolve => (finish = resolve)) },
    });
    handle.abort();
    finish({ project: 'late' });
    await handle.promise;
    await Promise.resolve();
    expect(state.instances).toHaveLength(0);
  });
});
