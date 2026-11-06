// @vitest-environment node
import { renderToString } from '@vue/server-renderer';
import { createSSRApp, h } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import ExDropdown from '../../../src/components/dropdown/ExDropdown.vue';
import type { DropdownItemData } from '../../../src/components/dropdown/types';

const items: DropdownItemData[] = [{ key: 'edit', label: '编辑' }];

describe('ExDropdown SSR', () => {
  it('初始受控可见状态不访问浏览器调度器', async () => {
    // 撤掉测试基础设施的浏览器 polyfill，准确覆盖文档构建的服务端渲染边界。
    vi.stubGlobal('requestAnimationFrame', undefined);
    vi.stubGlobal('cancelAnimationFrame', undefined);

    try {
      const app = createSSRApp({
        render: () =>
          h(
            ExDropdown,
            { items, visible: true },
            {
              default: ({ triggerProps }: { triggerProps: Record<string, unknown> }) =>
                h('button', { ...triggerProps, type: 'button' }, '菜单'),
            }
          ),
      });

      await expect(renderToString(app)).resolves.toContain('ex-dropdown');
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
