import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { compileScript, parse } from '@vue/compiler-sfc';
import { flushPromises, mount } from '@vue/test-utils';
import type { VueWrapper } from '@vue/test-utils';
import * as Vue from 'vue';
import { ModuleKind, ScriptTarget, transpileModule } from 'typescript';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ExFileUpload from '../../src/components/file-upload/ExFileUpload.vue';
import ExButton from '../../src/components/button/ExButton.vue';
import { DEMO_SERVICE_PREFIX } from '../../docs/.vitepress/demo-contract';
import type {
  UploadActionResolver,
  UploadConfigResolver,
  UploadHeaders,
} from '../../src/components/file-upload/types';

const readDocument = (name: string) =>
  readFileSync(resolve(process.cwd(), `docs/components/${name}.md`), 'utf8');

// 独立检查用法章节，避免基础演示通过后掩盖后续只有代码的章节。
const readSection = (document: string, title: string) => {
  const start = document.indexOf(`## ${title}\n`);
  expect(start, `缺少用法章节：${title}`).toBeGreaterThanOrEqual(0);
  const end = document.indexOf('\n## ', start + 1);
  return document.slice(start, end < 0 ? undefined : end);
};

// 运行真实页面脚本，验证示例绑定与文件转换结果，而不是只判断代码字符串存在。
const compileUploadDemo = (
  title: string | string[],
  copy: boolean,
  compressImage: unknown = vi.fn(),
  vueDependencies: Record<string, unknown> = Vue
) => {
  const document = readDocument('file-upload').replace(/\r\n/g, '\n');
  const section = (Array.isArray(title) ? title : [title])
    .map(heading => readSection(document, heading))
    .join('\n');
  const script = document
    .replace(/```[\s\S]*?```/g, '')
    .match(/<script setup>([\s\S]*?)<\/script>/)?.[1];
  const markup = [...section.matchAll(/::: raw\s*\n([\s\S]*?)\n:::/g)]
    .map(match => match[1])
    .join('\n');
  const serviceStatus = document.match(/<p role="status">[\s\S]*?<\/p>/)?.[0] ?? '';
  const source = copy
    ? (section.match(/```vue\s*\n([\s\S]*?)\n```/)?.[1] ?? '')
    : `<script setup>${script}</script><template>${serviceStatus}${markup}</template>`;
  const { descriptor } = parse(source);
  const compiled = compileScript(descriptor, { id: 'transfer-doc', inlineTemplate: true }).content;
  const executable = transpileModule(compiled, {
    compilerOptions: { target: ScriptTarget.ES2022, module: ModuleKind.ESNext },
  })
    .outputText.replace(/import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"];?/g, (_, names, path) => {
      return `const {${String(names).replace(/\s+as\s+/g, ': ')}} = dependencies[${JSON.stringify(path)}];`;
    })
    .replace('export default', 'return');
  return new Function('dependencies', executable)({
    vue: vueDependencies,
    '../../src/components/image-compress': { compressImage },
    '../.vitepress/demo-contract': { DEMO_SERVICE_PREFIX },
    'vue-ex-ui': { compressImage },
  }) as Vue.Component;
};

const demoOptions = {
  global: { components: { ExFileUpload, ExButton }, stubs: { ExFilePreview: true } },
};
const chooseFile = async (uploader: VueWrapper, file: File) => {
  const input = uploader.get('input[type="file"]');
  Object.defineProperty(input.element, 'files', { value: [file], configurable: true });
  await input.trigger('change');
  await flushPromises();
};

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ demo: true }))));
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('文件传输文档的可操作示例', () => {
  it.each([
    ['file-upload', '选择文件'],
    ['file-upload', '自动上传'],
    ['file-upload', '手动上传与结果'],
    ['file-upload', '动态上传配置与中止'],
    ['file-upload', '拖拽和图片列表'],
    ['file-upload', '加入前转换'],
    ['file-download', 'Link 传输'],
    ['file-download', 'Fetch 与进度'],
    ['file-download', '取消请求'],
    ['file-download', '自定义触发器和进度'],
  ])('%s 的 %s 同时提供运行区和默认折叠的源码', (name, title) => {
    const section = readSection(readDocument(name).replace(/\r\n/g, '\n'), title);
    expect(section).toMatch(/::: raw\s*\n[\s\S]*?<(?:ex-file-|ExFile)(?:upload|download)\b/i);
    expect(section).toMatch(/::: details 查看示例代码\s*\n```vue/);
    expect(section).not.toMatch(/::: details 查看示例代码\s+open/);
  });

  it('链接下载使用随文档发布的真实文件', () => {
    const document = readDocument('file-download');
    const source = document.match(/::: raw\s*\n([\s\S]*?)\n:::/)?.[1] ?? '';
    const asset = source.match(/url="(\/demo-assets\/[^"?]+)"/)?.[1];
    expect(asset).toBeDefined();
    expect(existsSync(resolve(process.cwd(), `docs/public${asset}`))).toBe(true);
    expect(document).not.toContain('/downloads/manual.pdf');
  });

  it('页面不再依赖未提供的业务接口与占位凭证', () => {
    const documents = ['file-upload', 'file-download'].map(readDocument).join('\n');
    expect(documents).not.toMatch(/\/api\/(?:files|exports|upload-ticket)/);
    expect(documents).not.toContain('Bearer token');
    expect(documents).not.toContain('getUploadToken');
  });

  it.each([false, true])('加入前转换返回可上传的真实 File（复制示例：%s）', async copy => {
    const compressed = new Blob(['converted-image'], { type: 'image/webp' });
    const compressImage = vi.fn().mockResolvedValue({ blob: compressed });
    const wrapper = mount(compileUploadDemo('加入前转换', copy, compressImage), demoOptions);
    try {
      const uploader = wrapper.findComponent(ExFileUpload);
      const original = new File(['source-image'], 'sample.png', { type: 'image/png' });
      await chooseFile(uploader, original);
      const converted = uploader.props('fileList')![0]?.raw;
      expect(converted).toBeInstanceOf(File);
      expect((converted as File).name).toBe('sample.webp');
      expect((converted as File).type).toBe('image/webp');
      expect((converted as File).size).toBe(compressed.size);
      expect(compressImage).toHaveBeenCalledWith(
        original,
        expect.objectContaining({
          mode: 'dimension',
          outputType: 'image/webp',
        })
      );
      expect(uploader.props('autoUpload')).toBe(false);
      expect(wrapper.get('output').text()).toContain('sample.webp · image/webp');
    } finally {
      wrapper.unmount();
    }
    expect(compressImage.mock.calls[0][1].signal.aborted).toBe(true);
  });

  it.each([false, true])('图片转换失败保留空列表并给出可见拒绝原因（复制示例：%s）', async copy => {
    const compressImage = vi.fn().mockRejectedValue(new Error('当前浏览器无法编码 WebP'));
    const wrapper = mount(compileUploadDemo('加入前转换', copy, compressImage), demoOptions);
    try {
      const uploader = wrapper.findComponent(ExFileUpload);
      await chooseFile(uploader, new File(['图片'], 'image.png', { type: 'image/png' }));
      expect(uploader.props('fileList')).toEqual([]);
      expect(wrapper.get('output').text()).toBe('未加入文件：before-add-error');
    } finally {
      wrapper.unmount();
    }
  });

  it.each([false, true])('选择文件示例实际接收列表回写且不启动上传（复制示例：%s）', async copy => {
    const wrapper = mount(compileUploadDemo('选择文件', copy), demoOptions);
    try {
      const uploader = wrapper.findComponent(ExFileUpload);
      const file = new File(['文档'], 'guide.pdf', { type: 'application/pdf' });
      await chooseFile(uploader, file);
      expect(uploader.props('fileList')?.map(item => item.name)).toEqual(['guide.pdf']);
      expect(uploader.props('fileList')?.[0].status).toBe('ready');
    } finally {
      wrapper.unmount();
    }
  });

  it('上传页的选择、拖拽与转换演示使用不同列表，预览与移除操作有实际效果', async () => {
    const compressImage = vi
      .fn()
      .mockResolvedValue({ blob: new Blob(['webp'], { type: 'image/webp' }) });
    const wrapper = mount(
      compileUploadDemo(['选择文件', '拖拽和图片列表', '加入前转换'], false, compressImage),
      demoOptions
    );
    try {
      const [selection, pictures, conversion] = wrapper.findAllComponents(ExFileUpload);
      await chooseFile(selection, new File(['文档'], 'guide.pdf', { type: 'application/pdf' }));
      await pictures.get('.ex-file-upload__drag').trigger('drop', {
        dataTransfer: { files: [new File(['图片'], 'picture.png', { type: 'image/png' })] },
      });
      await flushPromises();
      await chooseFile(conversion, new File(['图片'], 'convert.png', { type: 'image/png' }));
      expect(selection.props('fileList')?.map(file => file.name)).toEqual(['guide.pdf']);
      expect(pictures.props('fileList')?.map(file => file.name)).toEqual(['picture.png']);
      expect(conversion.props('fileList')?.map(file => file.name)).toEqual(['convert.webp']);
      pictures.vm.$emit('preview-request', pictures.props('fileList')![0]);
      await Vue.nextTick();
      expect(wrapper.findComponent({ name: 'ExFilePreview' }).attributes('visible')).toBe('true');
      pictures.vm.$emit('remove-request', pictures.props('fileList')![0]);
      await Vue.nextTick();
      expect(pictures.props('fileList')).toEqual([]);
      expect(selection.props('fileList')).toHaveLength(1);
    } finally {
      wrapper.unmount();
    }
  });

  it.each([false, true])('动态地址和请求头共用一个可中止的配置请求（复制示例：%s）', async copy => {
    const wrapper = mount(compileUploadDemo('动态上传配置与中止', copy), demoOptions);
    try {
      await flushPromises();
      const fetchMock = vi.mocked(fetch);
      fetchMock.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            action: `${DEMO_SERVICE_PREFIX}/upload`,
            headers: { 'X-Demo-Ticket': 'ticket' },
          })
        )
      );
      const uploader = wrapper.findComponent(ExFileUpload);
      const controller = new AbortController();
      const file = {
        uid: 'image',
        name: 'image.png',
        type: 'image/png',
        size: 4,
        status: 'ready' as const,
      };
      const action = uploader.props('action') as UploadActionResolver;
      const headers = uploader.props('headers') as UploadConfigResolver<UploadHeaders>;
      expect(await action(file, { signal: controller.signal })).toBe(
        `${DEMO_SERVICE_PREFIX}/upload`
      );
      expect(await headers(file, { signal: controller.signal })).toEqual({
        'X-Demo-Ticket': 'ticket',
      });
      expect(fetchMock.mock.calls.filter(([url]) => String(url).endsWith('/ticket'))).toEqual([
        [`${DEMO_SERVICE_PREFIX}/ticket`, { signal: controller.signal }],
      ]);
      let ticketSignal: AbortSignal | undefined;
      fetchMock.mockImplementationOnce(
        (_url, options) =>
          new Promise((_resolve, reject) => {
            ticketSignal = options?.signal ?? undefined;
            ticketSignal?.addEventListener(
              'abort',
              () => reject(new DOMException('已中止', 'AbortError')),
              { once: true }
            );
          })
      );
      await chooseFile(uploader, new File(['图片'], 'waiting.png', { type: 'image/png' }));
      expect(ticketSignal?.aborted).toBe(false);
      await wrapper
        .findAll('button')
        .find(button => button.text() === '中止配置解析或传输')!
        .trigger('click');
      await flushPromises();
      expect(ticketSignal?.aborted).toBe(true);
      expect(uploader.props('fileList')?.[0].status).toBe('ready');
      expect(wrapper.get('output').text()).toBe('已中止 1 个任务');
    } finally {
      wrapper.unmount();
    }
  });

  it.each([false, true])(
    '服务不可用时自动、手动和动态上传均明确禁用（复制示例：%s）',
    async copy => {
      for (const title of ['自动上传', '手动上传与结果', '动态上传配置与中止']) {
        vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({ demo: false })));
        const wrapper = mount(compileUploadDemo(title, copy), demoOptions);
        try {
          await flushPromises();
          expect(wrapper.findComponent(ExFileUpload).props('disabled')).toBe(true);
          expect(wrapper.text()).toContain('演示服务不可用');
          expect(wrapper.findAll('button').every(button => button.element.disabled)).toBe(true);
        } finally {
          wrapper.unmount();
        }
      }
    }
  );

  it.each([false, true])('卸载后迟到的健康检查不再回写状态（复制示例：%s）', async copy => {
    const trackedRefs: Vue.Ref<unknown>[] = [];
    let finishHealth!: (response: Response) => void;
    vi.mocked(fetch).mockImplementationOnce(
      () =>
        new Promise(resolveResponse => {
          finishHealth = resolveResponse;
        })
    );
    const wrapper = mount(
      compileUploadDemo('自动上传', copy, vi.fn(), {
        ...Vue,
        ref: (value: unknown) => {
          const tracked = Vue.ref(value);
          trackedRefs.push(tracked);
          return tracked;
        },
      }),
      demoOptions
    );
    const signal = vi.mocked(fetch).mock.calls[0][1]?.signal;
    wrapper.unmount();
    const before = trackedRefs.map(tracked => tracked.value);
    expect(signal?.aborted).toBe(true);
    finishHealth(new Response(JSON.stringify({ demo: true })));
    await flushPromises();
    expect(trackedRefs.map(tracked => tracked.value)).toEqual(before);
  });
});
