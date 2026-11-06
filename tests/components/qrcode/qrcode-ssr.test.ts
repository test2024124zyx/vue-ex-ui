// @vitest-environment node
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { describe, expect, it, vi } from 'vitest';
import ExQRCode from '../../../src/components/qrcode/ExQRCode.vue';

describe('二维码 Logo 服务端渲染', () => {
  it('服务端只输出展示结构，不请求 Logo 或创建 Blob URL', async () => {
    const create = vi.spyOn(URL, 'createObjectURL');
    const fetch = vi.spyOn(globalThis, 'fetch');
    try {
      const html = await renderToString(
        createSSRApp({
          render: () =>
            h(ExQRCode, { value: 'ssr' }, { icon: () => h('img', { src: '/logo.png' }) }),
        })
      );
      expect(html).toContain('/logo.png');
      expect(create).not.toHaveBeenCalled();
      expect(fetch).not.toHaveBeenCalled();
    } finally {
      create.mockRestore();
      fetch.mockRestore();
    }
  });
});
