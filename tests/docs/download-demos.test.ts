import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { compileScript, parse } from '@vue/compiler-sfc';
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils';
import * as Vue from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ExButton from '../../src/components/button/ExButton.vue';
import ExFileDownload from '../../src/components/file-download/ExFileDownload.vue';
import { DEMO_SERVICE_PREFIX } from '../../docs/.vitepress/demo-contract';

const readDocument = () =>
  readFileSync(resolve(process.cwd(), 'docs/components/file-download.md'), 'utf8').replace(
    /\r\n/g,
    '\n'
  );

// 将页面和折叠代码分别编译成真实 Vue 组件，传输层使用可控制的分段响应。
const compileDemo = (heading: string, copy: boolean, refs: Vue.Ref[] = []) => {
  const document = readDocument();
  const section = document.split(`## ${heading}\n`)[1]?.split('\n## ')[0] ?? '';
  const script = document
    .replace(/```[\s\S]*?```/g, '')
    .match(/<script setup>([\s\S]*?)<\/script>/)?.[1];
  const markup = section.match(/::: raw\s*\n([\s\S]*?)\n:::/)?.[1];
  const serviceStatus = document.match(/<p role="status">[\s\S]*?<\/p>/)?.[0] ?? '';
  let source = copy
    ? (section.match(/```vue\s*\n([\s\S]*?)\n```/)?.[1] ?? '')
    : `<script setup>${script}</script><template>${serviceStatus}${markup}</template>`;
  if (!source.includes('<script')) {
    source = `<script setup>defineOptions({ name: 'DownloadLinkDemo' })</script>${source}`;
  }
  const { descriptor } = parse(source);
  const compiled = compileScript(descriptor, { id: 'download-doc', inlineTemplate: true }).content;
  const executable = compiled
    .replace(/import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"];?/g, (_, names, path) => {
      return `const {${String(names).replace(/\s+as\s+/g, ': ')}} = dependencies[${JSON.stringify(path)}];`;
    })
    .replace('export default', 'return');
  return new Function('dependencies', executable)({
    vue: {
      ...Vue,
      ref: (value?: unknown) => {
        const reference = Vue.ref(value);
        refs.push(reference);
        return reference;
      },
    },
    '../.vitepress/demo-contract': { DEMO_SERVICE_PREFIX },
  }) as Vue.Component;
};

const deferred = <T>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(complete => {
    resolve = complete;
  });
  return { promise, resolve };
};

class DemoXhr extends EventTarget {
  static instances: DemoXhr[] = [];
  status = 200;
  statusText = 'OK';
  response = new Blob(['csv']);
  responseType = '';
  withCredentials = false;
  aborted = false;
  open = vi.fn();
  setRequestHeader = vi.fn();
  getResponseHeader = vi.fn(() => null);
  send = vi.fn();

  constructor() {
    super();
    DemoXhr.instances.push(this);
  }

  abort() {
    this.aborted = true;
    this.dispatchEvent(new Event('abort'));
  }
}

const OriginalURL = URL;
const downloadFetch = vi.fn<typeof fetch>();
let healthFetch: () => Promise<Response>;
let healthSignal: AbortSignal | null | undefined;
let anchors: { href: string; filename: string }[];
const wrappers: VueWrapper[] = [];

const mountDemo = (heading: string, copy: boolean, refs: Vue.Ref[] = []) => {
  const wrapper = mount(compileDemo(heading, copy, refs), {
    attachTo: document.body,
    global: { components: { ExButton, ExFileDownload } },
  });
  wrappers.push(wrapper);
  return wrapper;
};

const unmountDemo = (wrapper: VueWrapper) => {
  wrapper.unmount();
  wrappers.splice(wrappers.indexOf(wrapper), 1);
};

beforeEach(() => {
  anchors = [];
  DemoXhr.instances = [];
  downloadFetch.mockReset();
  healthSignal = undefined;
  healthFetch = () => Promise.resolve(new Response(JSON.stringify({ demo: true })));
  vi.stubGlobal('XMLHttpRequest', DemoXhr);
  vi.stubGlobal(
    'URL',
    class extends OriginalURL {
      static createObjectURL = vi.fn(() => 'blob:download-demo');
      static revokeObjectURL = vi.fn();
    }
  );
  vi.stubGlobal(
    'fetch',
    vi.fn<typeof fetch>((url, options) => {
      if (String(url).endsWith('/health')) {
        healthSignal = options?.signal;
        return healthFetch();
      }
      return downloadFetch(url, options);
    })
  );
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
    this: HTMLAnchorElement
  ) {
    anchors.push({ href: this.href, filename: this.download });
  });
});

afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount());
  document.body.innerHTML = '';
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('下载文档真实组件与页面绑定', () => {
  it.each([false, true])('Link 实际创建文件链接，且不误报保存成功（复制：%s）', async copy => {
    const wrapper = mountDemo('Link 传输', copy);
    const download = wrapper.getComponent(ExFileDownload);
    await download.get('button').trigger('click');
    expect(anchors).toEqual([
      {
        href: expect.stringContaining('/demo-assets/download-sample.csv'),
        filename: 'download-sample.csv',
      },
    ]);
    expect(download.emitted('trigger')).toHaveLength(1);
    expect(download.emitted('success')).toBeUndefined();
    expect(downloadFetch).not.toHaveBeenCalled();
  });

  it.each([
    [false, false],
    [false, true],
    [true, false],
    [true, true],
  ])('Fetch 分段进度和未知总量均可见（复制：%s，未知总量：%s）', async (copy, unknown) => {
    let controller!: ReadableStreamDefaultController<Uint8Array>;
    const stream = new ReadableStream<Uint8Array>({
      start: value => {
        controller = value;
      },
    });
    downloadFetch.mockResolvedValue(
      new Response(stream, {
        headers: unknown ? {} : { 'Content-Length': '4' },
      })
    );
    const wrapper = mountDemo('Fetch 与进度', copy);
    await flushPromises();
    await wrapper.findAll('input[type="checkbox"]')[0].setValue(unknown);
    const download = wrapper.getComponent(ExFileDownload);
    await download.get('button').trigger('click');
    controller.enqueue(new Uint8Array([65, 66]));
    await flushPromises();
    expect(wrapper.text()).toContain('已读取 2 字节');
    expect(wrapper.text()).toContain(unknown ? '总大小未知' : '总大小 4 字节');
    expect(downloadFetch.mock.calls[0][0]).toContain(`length=${unknown ? 'unknown' : 'known'}`);
    expect(download.emitted('progress')?.at(-1)?.[0]).toEqual({
      loaded: 2,
      total: unknown ? null : 4,
      percent: unknown ? null : 50,
    });
    controller.enqueue(new Uint8Array([67, 68]));
    controller.close();
    await flushPromises();
    expect(wrapper.text()).toContain('响应读取完成：4 字节，已交给浏览器下载');
    expect(anchors.at(-1)?.filename).toBe('fetch-report.csv');
    expect(download.get('button').attributes('disabled')).toBeUndefined();
  });

  it.each([false, true])('HTTP 503 有可读错误且允许重试（复制：%s）', async copy => {
    downloadFetch.mockResolvedValue(
      new Response(null, { status: 503, statusText: 'Service Unavailable' })
    );
    const wrapper = mountDemo('Fetch 与进度', copy);
    await flushPromises();
    await wrapper.findAll('input[type="checkbox"]')[1].setValue(true);
    const download = wrapper.getComponent(ExFileDownload);
    await download.get('button').trigger('click');
    await flushPromises();
    expect(downloadFetch.mock.calls[0][0]).toContain('outcome=error');
    expect(wrapper.text()).toContain('下载请求失败：503 Service Unavailable');
    expect(download.get('button').attributes('disabled')).toBeUndefined();
    expect(anchors).toHaveLength(0);
  });

  it.each([false, true])('XHR 取消按钮随请求状态启停并真正中止传输（复制：%s）', async copy => {
    const wrapper = mountDemo('取消请求', copy);
    await flushPromises();
    const cancel = wrapper.findAll('button').find(button => button.text() === '取消下载')!;
    expect(cancel.attributes('disabled')).toBeDefined();
    await wrapper.getComponent(ExFileDownload).get('button').trigger('click');
    expect(cancel.attributes('disabled')).toBeUndefined();
    expect(wrapper.text()).toContain('正在下载，可以取消');
    await cancel.trigger('click');
    await flushPromises();
    expect(DemoXhr.instances[0].aborted).toBe(true);
    expect(cancel.attributes('disabled')).toBeDefined();
    expect(wrapper.text()).toContain('请求已取消，可以重新下载');
    expect(anchors).toHaveLength(0);
  });

  it.each([
    [false, false],
    [false, true],
    [true, false],
    [true, true],
  ])('XHR 完成或失败后关闭取消操作且保留结果（复制：%s，失败：%s）', async (copy, failed) => {
    const wrapper = mountDemo('取消请求', copy);
    await flushPromises();
    await wrapper.getComponent(ExFileDownload).get('button').trigger('click');
    const request = DemoXhr.instances[0];
    if (failed) {
      request.status = 503;
      request.statusText = 'Service Unavailable';
    }
    request.dispatchEvent(new Event('load'));
    await flushPromises();
    const cancel = wrapper.findAll('button').find(button => button.text() === '取消下载')!;
    expect(cancel.attributes('disabled')).toBeDefined();
    expect(wrapper.text()).toContain(
      failed ? '下载请求失败：503' : '响应读取完成，已交给浏览器下载'
    );
    expect(
      wrapper.getComponent(ExFileDownload).get('button').attributes('disabled')
    ).toBeUndefined();
    expect(anchors).toHaveLength(failed ? 0 : 1);
  });

  it.each([false, true])('自定义进度插槽显示字节且取消按钮中止 Fetch（复制：%s）', async copy => {
    let controller!: ReadableStreamDefaultController<Uint8Array>;
    const stream = new ReadableStream<Uint8Array>({
      start: value => {
        controller = value;
      },
    });
    let signal: AbortSignal | null | undefined;
    downloadFetch.mockImplementation(async (_url, options) => {
      signal = options?.signal;
      signal?.addEventListener('abort', () =>
        controller.error(new DOMException('已取消', 'AbortError'))
      );
      return new Response(stream);
    });
    const wrapper = mountDemo('自定义触发器和进度', copy);
    await flushPromises();
    await wrapper.get('button').trigger('click');
    controller.enqueue(new Uint8Array([1, 2, 3]));
    await flushPromises();
    expect(wrapper.text()).toContain('已读取 3 字节');
    const cancel = wrapper.findAll('button').find(button => button.text() === '取消')!;
    await cancel.trigger('click');
    await flushPromises();
    expect(signal?.aborted).toBe(true);
    expect(wrapper.text()).toContain('已取消');
    expect(wrapper.findAll('button').some(button => button.text() === '取消')).toBe(false);
    expect(wrapper.get('button').attributes('disabled')).toBeUndefined();
    expect(anchors).toHaveLength(0);
  });

  it.each([
    ['Fetch 与进度', false],
    ['Fetch 与进度', true],
    ['取消请求', false],
    ['取消请求', true],
    ['自定义触发器和进度', false],
    ['自定义触发器和进度', true],
  ] as const)('%s 的服务不可用时禁用请求并显示反馈（复制：%s）', async (heading, copy) => {
    healthFetch = () => Promise.resolve(new Response(null, { status: 503 }));
    const wrapper = mountDemo(heading, copy);
    await flushPromises();
    expect(wrapper.getComponent(ExFileDownload).props('disabled')).toBe(true);
    expect(wrapper.text()).toContain('演示服务不可用');
    await wrapper.getComponent(ExFileDownload).get('button').trigger('click');
    expect(downloadFetch).not.toHaveBeenCalled();
    expect(DemoXhr.instances).toHaveLength(0);
  });

  it.each([
    ['Fetch 与进度', false],
    ['Fetch 与进度', true],
    ['取消请求', true],
    ['自定义触发器和进度', true],
  ] as const)('%s 的健康响应解析在卸载后完成也不回写（复制：%s）', async (heading, copy) => {
    const json = deferred<{ demo: boolean }>();
    const parseHealth = vi.fn(() => json.promise);
    healthFetch = () => Promise.resolve({ ok: true, json: parseHealth } as unknown as Response);
    const refs: Vue.Ref[] = [];
    const wrapper = mountDemo(heading, copy, refs);
    await flushPromises();
    expect(parseHealth).toHaveBeenCalled();
    const readiness = refs[0];
    expect(readiness.value).toBe(false);
    unmountDemo(wrapper);
    expect(healthSignal?.aborted).toBe(true);
    json.resolve({ demo: true });
    await flushPromises();
    expect(readiness.value).toBe(false);
  });

  it.each([
    ['Fetch 与进度', false],
    ['Fetch 与进度', true],
    ['取消请求', true],
    ['自定义触发器和进度', true],
  ] as const)('%s 在健康请求返回前卸载时不再解析响应（复制：%s）', async (heading, copy) => {
    const response = deferred<Response>();
    healthFetch = () => response.promise;
    const refs: Vue.Ref[] = [];
    const wrapper = mountDemo(heading, copy, refs);
    expect(wrapper.getComponent(ExFileDownload).props('disabled')).toBe(true);
    unmountDemo(wrapper);
    const parseHealth = vi.fn().mockResolvedValue({ demo: true });
    response.resolve({ ok: true, json: parseHealth } as unknown as Response);
    await flushPromises();
    expect(healthSignal?.aborted).toBe(true);
    expect(parseHealth).not.toHaveBeenCalled();
    expect(refs[0].value).toBe(false);
  });
});
