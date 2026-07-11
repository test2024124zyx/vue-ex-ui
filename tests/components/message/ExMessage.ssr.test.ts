// @vitest-environment node
import { renderToString } from '@vue/server-renderer';
import { createSSRApp, h } from 'vue';
import { describe, expect, it } from 'vitest';
import ExMessage from '../../../src/components/message/ExMessage.vue';

describe('ExMessage SSR', () => {
  it('无浏览器全局对象时安全渲染并转义 HTML 内容', async () => {
    // 服务端不启动可见状态和计时器，客户端挂载后再负责消息生命周期。
    const app = createSSRApp({
      render: () =>
        h(ExMessage, {
          content: '<strong>文本</strong><script>bad()</script>',
          dangerouslyUseHTMLString: true,
          duration: 0,
        }),
    });

    const html = await renderToString(app);
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-live="polite"');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;strong&gt;文本&lt;&#x2F;strong&gt;');
  });
});
