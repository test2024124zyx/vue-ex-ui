import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createUploadRequest } from '../../../src/components/file-upload/upload-request';
import { ExFileUploadError } from '../../../src/components/file-upload/errors';
import type { UploadFile } from '../../../src/components/file-upload/types';

type Listener = (event: ProgressEvent) => void;

/** 传输引擎单元测试使用的最小 XHR，可观测所有配置和终态。 */
class TransportXHR {
  static instances: TransportXHR[] = [];
  static openError: unknown;
  readonly listeners = new Map<string, Listener[]>();
  readonly uploadListeners = new Map<string, Listener[]>();
  readonly upload = {
    addEventListener: (type: string, listener: Listener) =>
      this.add(this.uploadListeners, type, listener),
  };
  status = 200;
  statusText = 'OK';
  responseText = '';
  contentType = 'text/plain';
  withCredentials = false;
  timeout = 0;
  open = vi.fn(() => {
    if (TransportXHR.openError) throw TransportXHR.openError;
  });
  setRequestHeader = vi.fn();
  send = vi.fn();
  getResponseHeader = vi.fn((name: string) =>
    name.toLowerCase() === 'content-type' ? this.contentType : null
  );
  abort = vi.fn(() => this.emit('abort'));

  constructor() {
    TransportXHR.instances.push(this);
  }

  addEventListener(type: string, listener: Listener): void {
    this.add(this.listeners, type, listener);
  }

  emit(
    type: string,
    progress: Partial<Pick<ProgressEvent, 'loaded' | 'total' | 'lengthComputable'>> = {}
  ): void {
    const event = {
      loaded: progress.loaded ?? 0,
      total: progress.total ?? 0,
      lengthComputable: progress.lengthComputable ?? false,
    } as ProgressEvent;
    for (const listener of this.uploadListeners.get(type) ?? []) listener(event);
    for (const listener of this.listeners.get(type) ?? []) listener(event);
  }

  private add(target: Map<string, Listener[]>, type: string, listener: Listener): void {
    target.set(type, [...(target.get(type) ?? []), listener]);
  }
}

const makeUploadFile = (withRaw = true): UploadFile => {
  const raw = new File(['content'], 'a.txt', { type: 'text/plain' });
  return {
    uid: 'a',
    name: raw.name,
    size: raw.size,
    type: raw.type,
    status: 'ready',
    percent: 0,
    raw: withRaw ? raw : undefined,
  };
};

describe('FileUpload XHR 传输引擎', () => {
  beforeEach(() => {
    TransportXHR.instances = [];
    TransportXHR.openError = undefined;
    vi.stubGlobal('XMLHttpRequest', TransportXHR as unknown as typeof XMLHttpRequest);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('解析动态配置、序列化 multipart 数据并过滤不可计算进度', async () => {
    const file = makeUploadFile();
    const extraBlob = new Blob(['extra'], { type: 'text/plain' });
    const progress = vi.fn();
    const action = vi.fn(async () => '/dynamic-upload');
    const headers = vi.fn(async () => ({ 'x-token': 'token' }));
    const data = vi.fn(async () => ({ text: 'value', blob: extraBlob, skipped: undefined }));
    const handle = createUploadRequest({
      file,
      action,
      headers,
      data,
      method: 'PATCH',
      name: 'asset',
      withCredentials: true,
      timeout: 250,
      onProgress: progress,
    });
    await vi.waitFor(() => expect(TransportXHR.instances).toHaveLength(1));

    const xhr = TransportXHR.instances[0];
    expect(xhr.open).toHaveBeenCalledWith('PATCH', '/dynamic-upload', true);
    expect(xhr.setRequestHeader).toHaveBeenCalledWith('x-token', 'token');
    expect(xhr.withCredentials).toBe(true);
    expect(xhr.timeout).toBe(250);
    const formData = xhr.send.mock.calls[0]?.[0] as FormData;
    expect(formData.get('text')).toBe('value');
    expect(formData.get('blob')).toBeInstanceOf(File);
    expect(formData.has('skipped')).toBe(false);
    expect(formData.get('asset')).toBeInstanceOf(File);

    xhr.emit('progress', { loaded: 1, total: 0, lengthComputable: false });
    expect(progress).not.toHaveBeenCalled();
    xhr.emit('progress', { loaded: 1, total: 2, lengthComputable: true });
    expect(progress).toHaveBeenCalledWith(50);

    xhr.responseText = 'plain response';
    xhr.emit('load');
    await expect(handle.promise).resolves.toEqual({
      outcome: 'success',
      response: 'plain response',
    });
    expect(handle.abort()).toBe(false);
  });

  it('按声明的 JSON 响应严格报告解析错误，空响应返回 null', async () => {
    const invalidHandle = createUploadRequest({ file: makeUploadFile(), action: '/upload' });
    await vi.waitFor(() => expect(TransportXHR.instances).toHaveLength(1));
    const invalidXhr = TransportXHR.instances[0];
    invalidXhr.contentType = 'application/problem+json';
    invalidXhr.responseText = '{invalid';
    invalidXhr.emit('load');
    const invalidResult = await invalidHandle.promise;
    expect(invalidResult.outcome).toBe('error');
    expect((invalidResult as { error: ExFileUploadError }).error.code).toBe('response-error');

    const emptyHandle = createUploadRequest({ file: makeUploadFile(), action: '/upload' });
    await vi.waitFor(() => expect(TransportXHR.instances).toHaveLength(2));
    TransportXHR.instances[1]?.emit('load');
    await expect(emptyHandle.promise).resolves.toEqual({ outcome: 'success', response: null });
  });

  it('非 JSON 内容即使形似 JSON 但解析失败，也保留原始文本', async () => {
    const handle = createUploadRequest({ file: makeUploadFile(), action: '/upload' });
    await vi.waitFor(() => expect(TransportXHR.instances).toHaveLength(1));
    const xhr = TransportXHR.instances[0];
    xhr.contentType = 'text/plain';
    xhr.responseText = '{not-json';
    xhr.emit('load');

    await expect(handle.promise).resolves.toEqual({ outcome: 'success', response: '{not-json' });
  });

  it.each([
    ['空 action', { action: '   ', file: makeUploadFile() }, 'configuration-error'],
    ['缺少 raw', { action: '/upload', file: makeUploadFile(false) }, 'configuration-error'],
    [
      '手动 Content-Type',
      {
        action: '/upload',
        file: makeUploadFile(),
        headers: { 'Content-Type': 'multipart/form-data' },
      },
      'configuration-error',
    ],
  ] as const)('%s 返回明确配置错误', async (_name, options, expectedCode) => {
    const result = await createUploadRequest(options).promise;
    expect(result.outcome).toBe('error');
    expect((result as { error: ExFileUploadError }).error.code).toBe(expectedCode);
  });

  it('动态配置异常保留 cause，并统一为 request-error', async () => {
    const cause = new Error('resolver failed');
    const result = await createUploadRequest({
      file: makeUploadFile(),
      action: async () => Promise.reject(cause),
    }).promise;

    expect(result.outcome).toBe('error');
    expect((result as { error: ExFileUploadError }).error).toMatchObject({
      code: 'request-error',
      cause,
    });
    expect(TransportXHR.instances).toHaveLength(0);
  });

  it('动态解析期间中止立即兑现 aborted，迟到配置不能创建 XHR', async () => {
    let resolveAction: ((url: string) => void) | undefined;
    let signal: AbortSignal | undefined;
    const handle = createUploadRequest({
      file: makeUploadFile(),
      action: (_file, context) =>
        new Promise(resolve => {
          signal = context.signal;
          resolveAction = resolve;
        }),
    });
    await Promise.resolve();

    expect(handle.abort()).toBe(true);
    expect(handle.abort()).toBe(false);
    expect(signal?.aborted).toBe(true);
    await expect(handle.promise).resolves.toEqual({ outcome: 'aborted' });
    resolveAction?.('/late');
    await Promise.resolve();
    expect(TransportXHR.instances).toHaveLength(0);
  });

  it('XHR 同步建连异常被收敛为 request-error', async () => {
    const cause = new Error('open failed');
    TransportXHR.openError = cause;
    const handle = createUploadRequest({ file: makeUploadFile(), action: '/upload' });

    await expect(handle.promise).resolves.toMatchObject({
      outcome: 'error',
      error: { code: 'request-error', cause },
    });
  });
});
