import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref, shallowRef } from 'vue';
import type { Ref } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import ExFileList from '../../src/components/file-list/ExFileList.vue';
import type { FileItem } from '../../src/components/file-list/types';
import ExFileDownload from '../../src/components/file-download/ExFileDownload.vue';
import type { ExFileDownloadExposed } from '../../src/components/file-download/types';
import type { PreviewFile } from '../../src/components/file-preview/types';

const readDocument = (name: string) =>
  readFileSync(resolve(process.cwd(), `docs/components/${name}.md`), 'utf8');

// 执行文档实际脚本，避免测试复制出来的另一套演示逻辑。
const runDocumentScript = <T>(name: string, bindings: string[], unmount = vi.fn()): T => {
  const script = readDocument(name).match(/<script setup>\s*([\s\S]*?)<\/script>/)?.[1] ?? '';
  return new Function(
    'ref',
    'shallowRef',
    'nextTick',
    'onBeforeUnmount',
    `${script.replace(/^import .*$/gm, '')}\nreturn { ${bindings.join(', ')} };`
  )(ref, shallowRef, nextTick, unmount) as T;
};

describe('文件展示文档的完整演示', () => {
  it.each([
    ['file-list', ['基础用法', '非受控初始值', '分页']],
    ['file-preview', ['基础用法', 'Blob 与 File', '文本与代码', '下载请求']],
    ['image-crop', ['基础用法', '固定比例', '圆形裁剪']],
  ] as const)('%s 的每个用法章节都有实时演示及默认折叠代码', (name, headings) => {
    const document = readDocument(name);
    headings.forEach(heading => {
      const section = document.split(`## ${heading}\n`)[1]?.split('\n## ')[0] ?? '';
      expect(section).toMatch(/::: raw[\s\S]*?:::\s+::: details 查看示例代码\s+```vue/);
    });
  });

  it('非受控初始值展示可见的已选报告，分页具有多页真实数据且接收页码回写', async () => {
    const demo = runDocumentScript<{
      defaultFiles: FileItem[];
      paginatedFiles: FileItem[];
      pageSize: number;
      paginationPage: { value: number };
    }>('file-list', ['defaultFiles', 'paginatedFiles', 'pageSize', 'paginationPage']);
    const defaults = mount(ExFileList, {
      props: {
        files: demo.defaultFiles,
        defaultSelectedIds: ['report'],
        defaultViewMode: 'grid',
        defaultSearchValue: 'report',
        selectable: true,
        showActions: false,
      },
    });
    expect(defaults.findAll('input[type="checkbox"]')).toHaveLength(1);
    expect(defaults.get<HTMLInputElement>('input[type="checkbox"]').element.checked).toBe(true);
    await defaults.get('input[type="checkbox"]').setValue(false);
    expect(defaults.get<HTMLInputElement>('input[type="checkbox"]').element.checked).toBe(false);
    defaults.unmount();

    const paginated = mount(ExFileList, {
      props: {
        files: demo.paginatedFiles,
        pageSize: demo.pageSize,
        showPagination: true,
        currentPage: demo.paginationPage.value,
        showActions: false,
        'onUpdate:currentPage': (page: number) => {
          demo.paginationPage.value = page;
          void paginated.setProps({ currentPage: page });
        },
      },
    });
    expect(demo.paginatedFiles.length).toBeGreaterThan(demo.pageSize);
    const firstPage = paginated.findAll('.ex-file-list__list-item-name').map(node => node.text());
    await paginated.get('.ex-pagination__next').trigger('click');
    await nextTick();
    expect(demo.paginationPage.value).toBe(2);
    expect(paginated.findAll('.ex-file-list__list-item-name').map(node => node.text())).not.toEqual(
      firstPage
    );
    paginated.unmount();
  });

  it('Blob、File 与代码示例在用户操作时创建独立来源，下载请求显示成功或错误结果', async () => {
    const demo = runDocumentScript<{
      blobVisible: { value: boolean };
      selectedFile: { value: Blob | undefined };
      textVisible: { value: boolean };
      textFiles: { value: File[] };
      downloadRef: { value: { download: () => Promise<{ outcome: string }> } | undefined };
      downloadFile: { value: { url: string; name: string } | undefined };
      downloadStatus: { value: string };
      openBlobPreview: () => void;
      handleFileChange: (event: { target: { files: File[]; value: string } }) => void;
      openTextPreview: () => void;
      handleDownloadRequest: (file: { url: string; name: string }) => Promise<void>;
    }>('file-preview', [
      'blobVisible',
      'selectedFile',
      'textVisible',
      'textFiles',
      'downloadRef',
      'downloadFile',
      'downloadStatus',
      'openBlobPreview',
      'handleFileChange',
      'openTextPreview',
      'handleDownloadRequest',
    ]);
    demo.openBlobPreview();
    expect(demo.selectedFile.value).toBeInstanceOf(Blob);
    expect(demo.blobVisible.value).toBe(true);
    expect(demo.textVisible.value).toBe(false);
    const selected = new File(['内容'], 'selected.txt', { type: 'text/plain' });
    const target = { files: [selected], value: 'selected.txt' };
    demo.handleFileChange({ target });
    expect(demo.selectedFile.value).toBe(selected);
    expect(target.value).toBe('');
    demo.openTextPreview();
    expect(demo.textFiles.value.map(file => file.type)).toEqual(['text/plain', 'text/typescript']);
    const download = vi.fn().mockResolvedValue({ outcome: 'triggered' });
    demo.downloadRef.value = { download };
    const file = { url: 'blob:preview-document', name: 'preview.txt' };
    await demo.handleDownloadRequest(file);
    expect(demo.downloadFile.value).toEqual(file);
    expect(download).toHaveBeenCalledOnce();
    expect(demo.downloadStatus.value).toContain('preview.txt');
    expect(demo.downloadStatus.value).toContain('浏览器');
    download.mockResolvedValueOnce({ outcome: 'error', error: new Error('下载失败') });
    await demo.handleDownloadRequest(file);
    expect(demo.downloadStatus.value).toContain('下载失败');
  });

  it('预览下载脚本将文件名和地址交给 ExFileDownload，创建并移除真实下载链接', async () => {
    const demo = runDocumentScript<{
      downloadRef: Ref<ExFileDownloadExposed | undefined>;
      downloadFile: { value: PreviewFile | undefined };
      downloadStatus: { value: string };
      handleDownloadRequest: (file: PreviewFile) => Promise<void>;
    }>('file-preview', ['downloadRef', 'downloadFile', 'downloadStatus', 'handleDownloadRequest']);
    const requestedLinks: { url: string; filename: string }[] = [];
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement
    ) {
      requestedLinks.push({ url: this.href, filename: this.download });
    });
    const host = mount(
      defineComponent({
        setup: () => () =>
          h(ExFileDownload, {
            ref: demo.downloadRef,
            url: demo.downloadFile.value?.url ?? '',
            filename: demo.downloadFile.value?.name ?? '',
            transport: 'link',
          }),
      })
    );
    await demo.handleDownloadRequest({ url: 'blob:local-document', name: 'local.txt' });
    expect(requestedLinks).toEqual([{ url: 'blob:local-document', filename: 'local.txt' }]);
    expect(document.querySelector('a[download="local.txt"]')).toBeNull();
    expect(demo.downloadStatus.value).toContain('已将 local.txt 的下载交给浏览器');
    host.unmount();
    click.mockRestore();
  });

  it('裁剪结果替换和卸载时释放对象地址，两个裁剪演示互不覆盖', () => {
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValueOnce('blob:first');
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL');
    const unmount = vi.fn();
    const demo = runDocumentScript<{
      ratioResult: { value: { url: string } | null };
      circleResult: { value: { url: string } | null };
      handleRatioCrop: (result: { blob: Blob }) => void;
      handleCircleCrop: (result: { blob: Blob }) => void;
    }>(
      'image-crop',
      ['ratioResult', 'circleResult', 'handleRatioCrop', 'handleCircleCrop'],
      unmount
    );
    const result = { blob: new Blob(['图片'], { type: 'image/png' }) };
    demo.handleRatioCrop(result);
    expect(demo.ratioResult.value?.url).toBe('blob:first');
    expect(demo.circleResult.value).toBeNull();
    createObjectURL.mockReturnValueOnce('blob:second');
    demo.handleRatioCrop(result);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:first');
    createObjectURL.mockReturnValueOnce('blob:circle');
    demo.handleCircleCrop(result);
    unmount.mock.calls[0][0]();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:second');
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:circle');
    vi.restoreAllMocks();
  });
});
