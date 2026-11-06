// @vitest-environment node
import { renderToString } from '@vue/server-renderer';
import { createSSRApp, h } from 'vue';
import { describe, expect, it } from 'vitest';
import ExModal from '../../../src/components/modal/ExModal.vue';

describe('ExModal SSR', () => {
  it('无浏览器全局对象时同步渲染初始打开且未传送的语义结构', async () => {
    const app = createSSRApp({
      render: () =>
        h(
          ExModal,
          {
            modelValue: true,
            appendToBody: false,
            title: '服务端确认',
            'aria-describedby': 'server-description',
          },
          () => h('p', { id: 'server-description' }, '服务端正文')
        ),
    });

    const html = await renderToString(app);
    expect(html).toContain('class="ex-modal');
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-describedby="server-description"');
    expect(html).toContain('服务端确认');
    expect(html).toContain('服务端正文');
  });
});
