// @vitest-environment node
import { createSSRApp } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ExFilePreview from '../../../src/components/file-preview/ExFilePreview.vue';
import ExFileUpload from '../../../src/components/file-upload/ExFileUpload.vue';

describe('文件组件服务端资源边界', () => {
  afterEach(() => vi.restoreAllMocks());

  it.each(['preview', 'upload'])('%s 在有 Blob URL API 的 Node 中也不分配对象地址', async kind => {
    const create = vi.spyOn(URL, 'createObjectURL');
    const revoke = vi.spyOn(URL, 'revokeObjectURL');
    const raw = new File(['image'], 'image.png', { type: 'image/png' });
    const app =
      kind === 'preview'
        ? createSSRApp(ExFilePreview, { file: raw, visible: false })
        : createSSRApp(ExFileUpload, {
            defaultFileList: [
              {
                uid: 'image',
                name: raw.name,
                type: raw.type,
                size: raw.size,
                status: 'ready',
                raw,
              },
            ],
          });
    try {
      await renderToString(app);
      expect(typeof document).toBe('undefined');
      expect(create).not.toHaveBeenCalled();
      expect(revoke).not.toHaveBeenCalled();
    } finally {
      // 红测也释放真实 Node Blob，避免测试本身留下资源。
      for (const result of create.mock.results) {
        if (result.type === 'return') URL.revokeObjectURL(result.value);
      }
    }
  });
});
